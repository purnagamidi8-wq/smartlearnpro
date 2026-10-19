const crypto = require('crypto');

// Generates a random token, returns both the raw value (sent to the user via
// email/link) and its SHA-256 hash (stored in the DB). We never store the
// raw verification/reset token, mirroring how bcrypt is used for passwords.
function generateToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

module.exports = { generateToken, hashToken };
