require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { hashPassword } = require('../services/authService');
const { User, Course, Module, Lesson, Quiz, Question, Enrollment, Progress } = require('../models');

// Section 36: seed script creates one admin, several students, and a sample
// course. Credentials below are for LOCAL DEVELOPMENT ONLY - change them
// (and rotate JWT_SECRET) before ever deploying anywhere real.
const SEED_ADMIN = { name: 'Platform Admin', email: 'admin@smartlearnpro.local', password: 'ChangeMe123!' };
const SEED_STUDENTS = [
  { name: 'Asha Rao', email: 'asha@smartlearnpro.local', password: 'ChangeMe123!' },
  { name: 'Kiran Patel', email: 'kiran@smartlearnpro.local', password: 'ChangeMe123!' },
  { name: 'Meera Nair', email: 'meera@smartlearnpro.local', password: 'ChangeMe123!' },
];

async function upsertUser({ name, email, password, role = 'student' }) {
  let user = await User.findOne({ email });
  if (user) return user;
  const passwordHash = await hashPassword(password);
  user = await User.create({ name, email, passwordHash, role, isEmailVerified: true });
  return user;
}

async function run() {
  await connectDB();
  console.log('[seed] connected. Seeding...');

  const admin = await upsertUser({ ...SEED_ADMIN, role: 'admin' });
  const students = [];
  for (const s of SEED_STUDENTS) students.push(await upsertUser(s));

  let course = await Course.findOne({ title: 'Full Stack Web Development' });
  if (!course) {
    course = await Course.create({
      title: 'Full Stack Web Development',
      description:
        'A complete beginner-to-job-ready path covering HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB.',
      category: 'Web Development',
      difficulty: 'beginner',
      instructor: 'SmartLearn Pro Staff',
      durationHours: 40,
      status: 'published',
      requiresApproval: true,
      learningObjectives: [
        'Build responsive web pages with HTML & CSS',
        'Write modern JavaScript',
        'Build UIs with React',
        'Build REST APIs with Node.js/Express',
        'Model and query data with MongoDB',
      ],
      prerequisites: ['Basic computer literacy'],
      createdBy: admin._id,
    });

    const moduleTitles = [
      'HTML & CSS',
      'JavaScript',
      'React',
      'Node.js',
      'Express.js',
      'MongoDB',
      'Full Stack Integration',
    ];

    const moduleIds = [];
    for (let i = 0; i < moduleTitles.length; i++) {
      const mod = await Module.create({ course: course._id, title: moduleTitles[i], order: i });
      moduleIds.push(mod._id);

      const lesson = await Lesson.create({
        module: mod._id,
        course: course._id,
        title: `${moduleTitles[i]}: Introduction`,
        description: `Get started with ${moduleTitles[i]}.`,
        order: 0,
        video: { url: null, provider: 'none', durationSeconds: 600, completionThresholdPercent: 90 },
        tutorialContent: [
          { type: 'heading', data: { text: `Welcome to ${moduleTitles[i]}` }, order: 0 },
          {
            type: 'paragraph',
            data: { text: `This lesson introduces the core concepts of ${moduleTitles[i]} used throughout the course.` },
            order: 1,
          },
          { type: 'summary', data: { text: 'You should now understand the basics before moving to the next lesson.' }, order: 2 },
        ],
        resources: [],
      });
      mod.lessonOrder = [lesson._id];
      await mod.save();

      // One short quiz per module
      const quiz = await Quiz.create({
        title: `${moduleTitles[i]} Quiz`,
        description: `Check your understanding of ${moduleTitles[i]}.`,
        course: course._id,
        module: mod._id,
        lesson: lesson._id,
        timeLimitMinutes: 10,
        passingScorePercent: 60,
        maxAttempts: 3,
      });
      const q1 = await Question.create({
        quiz: quiz._id,
        questionText: `Which topic does this module primarily cover?`,
        options: [moduleTitles[i], 'Photography', 'Cooking', 'Accounting'],
        correctAnswerIndex: 0,
        marks: 1,
        explanation: `This module is about ${moduleTitles[i]}.`,
        order: 0,
      });
      quiz.questions = [q1._id];
      await quiz.save();
      lesson.quiz = quiz._id;
      await lesson.save();
    }

    course.moduleOrder = moduleIds;
    await course.save();

    // Final proctored assessment for the whole course
    await Quiz.create({
      title: 'Full Stack Web Development - Final Assessment',
      description: 'Proctored final assessment covering the entire course.',
      course: course._id,
      isFinalAssessment: true,
      isProctored: true,
      timeLimitMinutes: 45,
      passingScorePercent: 60,
      maxAttempts: 2,
      questions: [],
    });
  }

  // Enroll first sample student and approve automatically for demo purposes
  const [student1] = students;
  let enrollment = await Enrollment.findOne({ student: student1._id, course: course._id });
  if (!enrollment) {
    enrollment = await Enrollment.create({
      student: student1._id,
      course: course._id,
      status: 'approved',
      decidedAt: new Date(),
      decidedBy: admin._id,
    });
    await Progress.create({ student: student1._id, course: course._id, lessons: [] });
  }

  console.log('[seed] done.');
  console.log('--------------------------------------------------');
  console.log('Seeded accounts (development only, CHANGE BEFORE PROD):');
  console.log(`  Admin:   ${SEED_ADMIN.email} / ${SEED_ADMIN.password}`);
  SEED_STUDENTS.forEach((s) => console.log(`  Student: ${s.email} / ${s.password}`));
  console.log('--------------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
