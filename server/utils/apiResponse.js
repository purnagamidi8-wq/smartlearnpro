// Consistent API response shape (Section 35)
function success(res, { message = 'Success', data = {}, statusCode = 200 } = {}) {
  return res.status(statusCode).json({ success: true, message, data });
}

function failure(res, { message = 'Something went wrong', statusCode = 500, errors = null } = {}) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { success, failure };
