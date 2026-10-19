const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Certificate } = require('../models');
const { nextSequence } = require('../models/Counter');
const logger = require('../utils/logger');

async function generateCertificateId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`certificate-${year}`);
  return `SLP-${year}-${String(seq).padStart(6, '0')}`;
}

// Checks the course's configurable completion requirements (Section 40)
// against a student's Progress + final QuizAttempt.
function meetsCompletionRequirements(course, progress, finalAttempt) {
  const req = course.completionRequirements;
  const completionOk = progress.overallCompletionPercent >= req.minCompletionPercent;
  const quizOk = progress.averageQuizScorePercent >= req.minQuizScorePercent;
  const finalOk = !req.requireFinalAssessmentPass || (finalAttempt && finalAttempt.passed);
  return completionOk && quizOk && finalOk;
}

const OUTPUT_DIR = path.join(__dirname, '..', 'uploads', 'certificates');

async function generateCertificatePdf({ certificateId, studentName, courseTitle, completionDate, finalScorePercent }) {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filePath = path.join(OUTPUT_DIR, `${certificateId}.pdf`);

  await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke('#4338ca');

      doc.fontSize(28).fillColor('#4338ca').text('SmartLearn Pro', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(20).fillColor('#1e293b').text('Certificate of Completion', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(14).fillColor('#334155').text('This certifies that', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(24).fillColor('#111827').text(studentName, { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(14).fillColor('#334155').text('has successfully completed the course', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(20).fillColor('#111827').text(courseTitle, { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(12).fillColor('#334155').text(`Final Score: ${finalScorePercent}%`, { align: 'center' });
      doc.text(`Completion Date: ${completionDate}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(10).fillColor('#64748b').text(`Certificate ID: ${certificateId}`, { align: 'center' });
      doc.text('Verify at: /verify-certificate/' + certificateId, { align: 'center' });

      doc.moveDown(2);
      const y = doc.y;
      doc.moveTo(doc.page.width / 2 - 100, y).lineTo(doc.page.width / 2 + 100, y).stroke('#94a3b8');
      doc.fontSize(10).text('Authorized Signature', doc.page.width / 2 - 100, y + 5, { width: 200, align: 'center' });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });

  logger.info('certificate_pdf_generated', { certificateId, filePath });
  return `/uploads/certificates/${certificateId}.pdf`;
}

module.exports = { generateCertificateId, meetsCompletionRequirements, generateCertificatePdf };
