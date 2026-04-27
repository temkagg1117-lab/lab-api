function createProblem(status, title, detail, extras = {}) {
  const error = new Error(detail || title);
  error.status = status;
  error.title = title;
  error.detail = detail;
  error.extras = extras;
  return error;
}

module.exports = {
  createProblem
};
