// Configurable proctoring behavior. Admins can eventually expose these via
// /admin/settings; for now they load from env (JSON) with sane defaults.

const DEFAULT_WEIGHTS = {
  FACE_NOT_DETECTED: 10,
  MULTIPLE_FACES: 25,
  FACE_DEVIATION: 8,
  TAB_SWITCH: 15,
  FULLSCREEN_EXIT: 10,
  AUDIO_ANOMALY: 5,
};

const DEFAULT_THRESHOLDS = {
  NORMAL_MAX: 20,
  WARNING_MAX: 50,
  HIGH_RISK_MAX: 75,
  // anything above HIGH_RISK_MAX is CRITICAL
};

const DEFAULT_AUDIO_CONFIG = {
  thresholdDb: -20, // rough loudness threshold, tune per deployment
  minDurationMs: 1500,
  cooldownMs: 5000,
};

function loadWeights() {
  if (process.env.PROCTOR_RISK_WEIGHTS_JSON) {
    try {
      return { ...DEFAULT_WEIGHTS, ...JSON.parse(process.env.PROCTOR_RISK_WEIGHTS_JSON) };
    } catch (e) {
      console.warn('[proctoringConfig] failed to parse PROCTOR_RISK_WEIGHTS_JSON, using defaults');
    }
  }
  return DEFAULT_WEIGHTS;
}

function classifyRisk(score, thresholds = DEFAULT_THRESHOLDS) {
  if (score <= thresholds.NORMAL_MAX) return 'NORMAL';
  if (score <= thresholds.WARNING_MAX) return 'WARNING';
  if (score <= thresholds.HIGH_RISK_MAX) return 'HIGH_RISK';
  return 'CRITICAL';
}

module.exports = {
  weights: loadWeights(),
  thresholds: DEFAULT_THRESHOLDS,
  audio: DEFAULT_AUDIO_CONFIG,
  classifyRisk,
};
