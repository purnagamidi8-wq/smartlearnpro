const { Quiz, Question, QuizAttempt, Progress, Enrollment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');
const { sendEmail, templates } = require('../services/emailService');
const { notify } = require('../services/notificationService');

// GET /api/quizzes/:id  (student-safe view - never leaks correctAnswerIndex)
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate({
    path: 'questions',
    select: 'questionText questionType options marks order',
  });
  if (!quiz) return failure(res, { message: 'Quiz not found', statusCode: 404 });

  if (req.user.role === 'student') {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: quiz.course, status: 'approved' });
    if (!enrollment) return failure(res, { message: 'Not enrolled in this course', statusCode: 403 });

    const attemptCount = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user._id });
    if (attemptCount >= quiz.maxAttempts) {
      return failure(res, { message: 'Maximum attempts reached for this quiz', statusCode: 403 });
    }
  }

  return success(res, { data: { quiz } });
});

// POST /api/quizzes/:id/submit  body: { answers: [{ questionId, selectedIndex }], proctorSessionId? }
const submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('questions');
  if (!quiz) return failure(res, { message: 'Quiz not found', statusCode: 404 });

  const attemptCount = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user._id });
  if (attemptCount >= quiz.maxAttempts) {
    return failure(res, { message: 'Maximum attempts reached for this quiz', statusCode: 403 });
  }
  if (quiz.isProctored && !req.body.proctorSessionId) {
    return failure(res, { message: 'A proctoring session is required for this assessment', statusCode: 400 });
  }

  const submittedAnswers = req.body.answers || [];
  let totalMarks = 0;
  let marksObtained = 0;

  const answers = quiz.questions.map((q) => {
    totalMarks += q.marks;
    const submitted = submittedAnswers.find((a) => String(a.questionId) === String(q._id));
    const selectedIndex = submitted ? submitted.selectedIndex : null;
    const isCorrect = selectedIndex !== null && selectedIndex === q.correctAnswerIndex;
    const marksAwarded = isCorrect ? q.marks : 0;
    marksObtained += marksAwarded;
    return { question: q._id, selectedIndex, isCorrect, marksAwarded };
  });

  const scorePercent = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
  const passed = scorePercent >= quiz.passingScorePercent;

  const attempt = await QuizAttempt.create({
    quiz: quiz._id,
    student: req.user._id,
    answers,
    totalMarks,
    marksObtained,
    scorePercent,
    passed,
    submittedAt: new Date(),
    attemptNumber: attemptCount + 1,
    proctorSession: req.body.proctorSessionId || null,
  });

  // Update course-level progress aggregates (Section 39)
  const progress = await Progress.findOne({ student: req.user._id, course: quiz.course });
  if (progress) {
    const allAttempts = await QuizAttempt.find({ student: req.user._id }).populate({
      path: 'quiz',
      match: { course: quiz.course },
    });
    const relevant = allAttempts.filter((a) => a.quiz);
    if (relevant.length > 0) {
      progress.averageQuizScorePercent = Math.round(
        relevant.reduce((sum, a) => sum + a.scorePercent, 0) / relevant.length
      );
    }
    if (quiz.isFinalAssessment && passed) {
      progress.finalAssessmentPassed = true;
    }
    await progress.save();
  }

  await notify(req.user._id, {
    type: 'QUIZ_RESULT',
    title: 'Quiz result',
    message: `You scored ${scorePercent}% on ${quiz.title}`,
  });
  await sendEmail({ to: req.user.email, ...templates.quizCompletion(req.user, quiz.title, scorePercent, passed) });

  return success(res, {
    message: 'Quiz submitted',
    data: { scorePercent, marksObtained, totalMarks, passed, attemptId: attempt._id },
  });
});

// GET /api/quizzes/:id/results
const getQuizResults = asyncHandler(async (req, res) => {
  const filter = { quiz: req.params.id };
  if (req.user.role === 'student') filter.student = req.user._id;

  const attempts = await QuizAttempt.find(filter).sort({ createdAt: -1 }).populate('student', 'name email');
  return success(res, { data: { attempts } });
});

// Admin: create quiz + questions
// POST /api/quizzes  body: { title, course, module?, lesson?, questions: [...] , ...settings }
const createQuiz = asyncHandler(async (req, res) => {
  const { questions, ...quizFields } = req.body;
  const quiz = await Quiz.create(quizFields);

  if (Array.isArray(questions) && questions.length > 0) {
    const created = await Question.insertMany(
      questions.map((q, idx) => ({ ...q, quiz: quiz._id, order: idx }))
    );
    quiz.questions = created.map((q) => q._id);
    await quiz.save();
  }

  return success(res, { message: 'Quiz created', statusCode: 201, data: { quiz } });
});

module.exports = { getQuiz, submitQuiz, getQuizResults, createQuiz };
