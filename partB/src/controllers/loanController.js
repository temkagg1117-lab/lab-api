const { db } = require("../data/db");
const loanService = require("../services/loanService");
const { createProblem } = require("../utils/problem");
const { applyFiltering, applySorting, paginate } = require("../utils/query");

function listLoans(req, res) {
  const filtered = applyFiltering(db.loans, req.query, ["memberId", "bookId", "status"]);
  const sorted = applySorting(filtered, req.query.sortBy, req.query.sortOrder, [
    "loanDate",
    "dueDate",
    "memberId",
    "bookId",
    "status"
  ]);

  res.json(paginate(sorted, req.query));
}

function getLoan(req, res, next) {
  const loan = loanService.getLoanById(req.params.id);
  if (!loan) {
    return next(createProblem(404, "Loan not found", `Loan '${req.params.id}' does not exist.`));
  }

  return res.json(loan);
}

function createLoan(req, res, next) {
  const { memberId, bookId } = req.body;
  if (!memberId || !bookId) {
    return next(createProblem(400, "Invalid loan payload", "memberId and bookId are required."));
  }

  try {
    const loan = loanService.createLoan(memberId, bookId);
    return res.status(201).json(loan);
  } catch (error) {
    return next(error);
  }
}

function returnLoan(req, res, next) {
  try {
    const loan = loanService.returnLoan(req.params.id);
    return res.status(200).json(loan);
  } catch (error) {
    return next(error);
  }
}

function extendLoan(req, res, next) {
  try {
    const loan = loanService.extendLoan(req.params.id);
    return res.status(200).json(loan);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createLoan,
  extendLoan,
  getLoan,
  listLoans,
  returnLoan
};
