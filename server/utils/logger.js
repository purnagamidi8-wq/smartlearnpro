// Minimal structured logger. Section 41: never log secrets/passwords/tokens.
const REDACT_KEYS = ['password', 'passwordHash', 'smtpPassword', 'jwtSecret', 'token', 'apiKey', 'secret'];

function redact(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  const clone = { ...meta };
  for (const key of Object.keys(clone)) {
    if (REDACT_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      clone[key] = '[redacted]';
    }
  }
  return clone;
}

function log(level, message, meta) {
  const entry = { level, message, time: new Date().toISOString(), ...redact(meta) };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else console.log(line);
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};
