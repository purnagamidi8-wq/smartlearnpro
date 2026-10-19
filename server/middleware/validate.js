const { failure } = require('../utils/apiResponse');

// Lightweight schema validator middleware factory. Pass a function
// (body) => string[] of error messages (empty array = valid).
function validate(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body || {}) || [];
    if (errors.length > 0) {
      return failure(res, { message: 'Validation failed', statusCode: 400, errors });
    }
    next();
  };
}

module.exports = validate;
