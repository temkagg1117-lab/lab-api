const { db } = require("../data/db");
const { createProblem } = require("../utils/problem");

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(createProblem(401, "Unauthorized", "A Bearer token is required."));
  }

  const token = header.slice("Bearer ".length).trim();
  const user = db.users.find((item) => item.username === token);
  if (!user) {
    return next(createProblem(401, "Unauthorized", "The supplied token is invalid."));
  }

  req.user = user;
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(createProblem(401, "Unauthorized", "Authentication is required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(createProblem(403, "Forbidden", "You do not have permission to perform this action."));
    }

    return next();
  };
}

module.exports = auth;
module.exports.requireRole = requireRole;
