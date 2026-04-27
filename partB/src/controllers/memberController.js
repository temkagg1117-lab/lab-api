const { db, createId } = require("../data/db");
const { createProblem } = require("../utils/problem");
const { applyFiltering, applySorting, paginate } = require("../utils/query");

function listMembers(req, res) {
  const filtered = applyFiltering(db.members, req.query, ["name", "email", "status"]);
  const sorted = applySorting(filtered, req.query.sortBy, req.query.sortOrder, ["name", "email", "status"]);
  res.json(paginate(sorted, req.query));
}

function getMember(req, res, next) {
  const member = db.members.find((item) => item.id === req.params.id);
  if (!member) {
    return next(createProblem(404, "Member not found", `Member '${req.params.id}' does not exist.`));
  }

  return res.json(member);
}

function createMember(req, res, next) {
  const { name, email, status = "active" } = req.body;
  if (!name || !email) {
    return next(createProblem(400, "Invalid member payload", "name and email are required."));
  }

  if (!["active", "suspended"].includes(status)) {
    return next(createProblem(422, "Invalid member status", "status must be either active or suspended."));
  }

  const existing = db.members.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
  if (existing) {
    return next(createProblem(409, "Member already exists", `Email '${email}' is already registered.`));
  }

  const member = { id: createId("member"), name, email, status };
  db.members.push(member);
  return res.status(201).json(member);
}

module.exports = {
  createMember,
  getMember,
  listMembers
};
