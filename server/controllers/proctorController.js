const { ProctorSession, ProctorEvent, Quiz } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');
const { recordEvent } = require('../services/proctoringService');
const { notifyAllAdmins } = require('../services/notificationService');
const { User } = require('../models');

let ioInstance = null;
function attachSocketServer(io) {
  ioInstance = io;
}

function broadcastSessionUpdate(session) {
  if (ioInstance) {
    ioInstance.to('admins:proctoring').emit('proctoring:session_update', session);
  }
}

// POST /api/proctor/start  body: { courseId, quizId, cameraGranted, micGranted }
const startSession = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.body.quizId);
  if (!quiz) return failure(res, { message: 'Assessment not found', statusCode: 404 });

  const session = await ProctorSession.create({
    student: req.user._id,
    course: req.body.courseId,
    quiz: req.body.quizId,
    cameraGranted: !!req.body.cameraGranted,
    micGranted: !!req.body.micGranted,
  });

  const populated = await session.populate('student', 'name');
  broadcastSessionUpdate(populated);

  return success(res, { message: 'Proctoring session started', statusCode: 201, data: { session } });
});

// POST /api/proctor/event  body: { sessionId, eventType, metadata }
const logEvent = asyncHandler(async (req, res) => {
  const { sessionId, eventType, metadata } = req.body;

  const session = await ProctorSession.findById(sessionId);
  if (!session) return failure(res, { message: 'Session not found', statusCode: 404 });
  if (String(session.student) !== String(req.user._id)) {
    return failure(res, { message: 'Forbidden', statusCode: 403 });
  }

  const { event, session: updatedSession } = await recordEvent(sessionId, req.user._id, eventType, metadata);

  const populated = await updatedSession.populate('student', 'name');
  broadcastSessionUpdate(populated);

  if (updatedSession.riskLevel === 'HIGH_RISK' || updatedSession.riskLevel === 'CRITICAL') {
    await notifyAllAdmins(User, {
      type: 'PROCTORING_ALERT',
      title: 'High-risk proctoring session',
      message: `Session for ${req.user.name} reached risk level ${updatedSession.riskLevel}`,
      link: `/admin/proctoring/${sessionId}`,
    });
  }

  return success(res, { message: 'Event recorded', data: { event, riskScore: updatedSession.riskScore, riskLevel: updatedSession.riskLevel } });
});

// POST /api/proctor/end  body: { sessionId }
const endSession = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findById(req.body.sessionId);
  if (!session) return failure(res, { message: 'Session not found', statusCode: 404 });
  if (String(session.student) !== String(req.user._id) && req.user.role !== 'admin') {
    return failure(res, { message: 'Forbidden', statusCode: 403 });
  }

  session.status = 'completed';
  session.endedAt = new Date();
  await session.save();

  const populated = await session.populate('student', 'name');
  broadcastSessionUpdate(populated);

  return success(res, { message: 'Proctoring session ended', data: { session } });
});

// GET /api/proctor/session/:id
const getSession = asyncHandler(async (req, res) => {
  const session = await ProctorSession.findById(req.params.id)
    .populate('student', 'name email')
    .populate('course', 'title')
    .populate('quiz', 'title');
  if (!session) return failure(res, { message: 'Session not found', statusCode: 404 });

  const events = await ProctorEvent.find({ session: session._id }).sort({ timestamp: -1 });
  return success(res, { data: { session, events } });
});

// GET /api/proctor/sessions (admin) - active/all sessions for dashboard
const listSessions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const sessions = await ProctorSession.find(filter)
    .populate('student', 'name')
    .populate('course', 'title')
    .populate('quiz', 'title')
    .sort({ createdAt: -1 })
    .limit(100);

  return success(res, { data: { sessions } });
});

module.exports = { attachSocketServer, startSession, logEvent, endSession, getSession, listSessions };
