const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let etherealWarningLogged = false;

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_HOST !== 'smtp.example.com' &&
    process.env.SMTP_USER &&
    process.env.SMTP_USER !== 'replace_me' &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_PASSWORD !== 'replace_me'
  );
}

async function getTransporter() {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM in server/.env.');
    }

    if (!etherealWarningLogged) {
      logger.warn('smtp_missing_using_ethereal', {
        message: 'No real SMTP config found. Using a temporary Ethereal inbox for local email testing.',
      });
      etherealWarningLogged = true;
    }

    const account = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, password: process.env.SMTP_PASSWORD }
      : undefined,
  });
}

function baseTemplate({ heading, bodyHtml, ctaLabel, ctaUrl }) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color:#1e293b;">
    <div style="text-align:center; margin-bottom: 24px;">
      <span style="font-size: 20px; font-weight: 700; color:#4338ca;">SmartLearn Pro</span>
    </div>
    <div style="background:#f8fafc; border-radius: 12px; padding: 24px;">
      <h2 style="margin-top:0; color:#1e293b;">${heading}</h2>
      <div style="font-size: 14px; line-height: 1.6; color:#334155;">${bodyHtml}</div>
      ${ctaUrl ? `<div style="text-align:center; margin-top: 24px;">
        <a href="${ctaUrl}" style="background:#4338ca; color:#fff; text-decoration:none; padding: 10px 20px; border-radius: 8px; font-size: 14px;">${ctaLabel || 'View'}</a>
      </div>` : ''}
    </div>
    <p style="font-size: 12px; color:#94a3b8; text-align:center; margin-top: 16px;">
      This is an automated message from SmartLearn Pro. Please do not reply directly to this email.
    </p>
  </div>`;
}

async function sendEmail({ to, subject, heading, bodyHtml, ctaLabel, ctaUrl }) {
  try {
    const html = baseTemplate({ heading, bodyHtml, ctaLabel, ctaUrl });
    const mailTransport = await getTransporter();
    const fromAddress = (process.env.EMAIL_FROM || process.env.SMTP_USER || '').trim();
    const info = await mailTransport.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info('email_sent_test_account', { to, subject, previewUrl });
    } else {
      logger.info('email_sent', { to, subject });
    }

    return { success: true, previewUrl };
  } catch (err) {
    logger.error('email_failed', { to, subject, error: err.message });
    return { success: false, error: err.message };
  }
}

const templates = {
  registrationConfirmation: (user) => ({
    subject: 'Welcome to SmartLearn Pro',
    heading: `Welcome, ${user.name}!`,
    bodyHtml: `<p>Your account has been created. Please verify your email to get started.</p>`,
  }),
  verifyEmail: (user, url) => ({
    subject: 'Verify your SmartLearn Pro email',
    heading: 'Confirm your email address',
    bodyHtml: `<p>Hi ${user.name}, click below to verify your email. This link expires in 24 hours.</p>`,
    ctaLabel: 'Verify Email',
    ctaUrl: url,
  }),
  passwordReset: (user, url) => ({
    subject: 'Reset your SmartLearn Pro password',
    heading: 'Password reset requested',
    bodyHtml: `<p>Hi ${user.name}, click below to set a new password. This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
    ctaLabel: 'Reset Password',
    ctaUrl: url,
  }),
  enrollmentRequested: (adminName, studentName, courseTitle) => ({
    subject: `New enrollment request: ${courseTitle}`,
    heading: 'New enrollment request',
    bodyHtml: `<p>Hi ${adminName}, ${studentName} has requested enrollment in <b>${courseTitle}</b>.</p>`,
  }),
  enrollmentApproved: (user, courseTitle, url) => ({
    subject: `Enrollment approved: ${courseTitle}`,
    heading: 'You are enrolled!',
    bodyHtml: `<p>Hi ${user.name}, your enrollment in <b>${courseTitle}</b> has been approved. You can start learning now.</p>`,
    ctaLabel: 'Go to course',
    ctaUrl: url,
  }),
  enrollmentRejected: (user, courseTitle, reason) => ({
    subject: `Enrollment update: ${courseTitle}`,
    heading: 'Enrollment request declined',
    bodyHtml: `<p>Hi ${user.name}, your enrollment request for <b>${courseTitle}</b> was not approved.${reason ? ` Reason: ${reason}` : ''}</p>`,
  }),
  quizCompletion: (user, quizTitle, scorePercent, passed) => ({
    subject: `Quiz result: ${quizTitle}`,
    heading: passed ? 'Great job!' : 'Quiz attempt recorded',
    bodyHtml: `<p>Hi ${user.name}, you scored <b>${scorePercent}%</b> on <b>${quizTitle}</b>. Status: ${passed ? 'Passed' : 'Not passed'}.</p>`,
  }),
  courseCompletion: (user, courseTitle) => ({
    subject: `Course completed: ${courseTitle}`,
    heading: 'Course completed!',
    bodyHtml: `<p>Hi ${user.name}, congratulations on completing <b>${courseTitle}</b>.</p>`,
  }),
  certificateAvailable: (user, courseTitle, url) => ({
    subject: `Your certificate is ready: ${courseTitle}`,
    heading: 'Certificate available',
    bodyHtml: `<p>Hi ${user.name}, your certificate for <b>${courseTitle}</b> is ready to download.</p>`,
    ctaLabel: 'View certificate',
    ctaUrl: url,
  }),
};

module.exports = { sendEmail, templates };
