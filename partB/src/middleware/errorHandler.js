module.exports = (err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).type("application/problem+json").json({
    type: err.type || "about:blank",
    title: err.title || "Internal Server Error",
    status,
    detail: err.detail || "An unexpected error occurred.",
    instance: req.originalUrl,
    ...err.extras
  });
};
