const { ProctorSession, ProctorEvent } = require('../models');
const proctoringConfig = require('../config/proctoringConfig');

const NEUTRAL_LABELS = {
  FACE_NOT_DETECTED: 'Face not visible',
  MULTIPLE_FACES: 'Multiple faces detected',
  FACE_DEVIATION: 'Face position deviation',
  FACE_RETURNED: 'Face detection resumed',
  AUDIO_ANOMALY: 'Unusual audio level detected',
  TAB_SWITCH: 'Browser tab switched away',
  FULLSCREEN_EXIT: 'Exited fullscreen mode',
};

// Section 15/48: events are recorded as neutral "potential integrity events",
// never as proof of cheating. Risk scoring is entirely separate from the
// academic quiz score (QuizAttempt.scorePercent).
async function recordEvent(sessionId, studentId, eventType, metadata = {}) {
  const weight = proctoringConfig.weights[eventType] || 0;

  const event = await ProctorEvent.create({
    session: sessionId,
    student: studentId,
    eventType,
    label: NEUTRAL_LABELS[eventType] || 'Potential Integrity Event',
    severityWeight: weight,
    metadata,
  });

  const session = await ProctorSession.findById(sessionId);
  if (!session) return event;

  session.riskScore += weight;
  session.eventCount += 1;
  session.riskLevel = proctoringConfig.classifyRisk(session.riskScore, proctoringConfig.thresholds);
  await session.save();

  return { event, session };
}

module.exports = { recordEvent, NEUTRAL_LABELS };
