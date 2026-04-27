const { DAY_IN_MS, createDueDate, createId, db } = require("../data/db");
const { createProblem } = require("../utils/problem");

function getMemberById(memberId) {
  return db.members.find((member) => member.id === memberId);
}

function getBookById(bookId) {
  return db.books.find((book) => book.id === bookId);
}

function getLoanById(loanId) {
  return db.loans.find((loan) => loan.id === loanId);
}

function getActiveLoansForMember(memberId) {
  return db.loans.filter((loan) => loan.memberId === memberId && loan.status === "active");
}

function ensureLoanable(memberId, bookId) {
  const member = getMemberById(memberId);
  if (!member) {
    throw createProblem(404, "Member not found", `Member '${memberId}' does not exist.`);
  }

  const book = getBookById(bookId);
  if (!book) {
    throw createProblem(404, "Book not found", `Book '${bookId}' does not exist.`);
  }

  if (member.status !== "active") {
    throw createProblem(403, "Member is not eligible", `Member '${memberId}' is not active.`);
  }

  const activeLoans = getActiveLoansForMember(memberId);
  if (activeLoans.length >= 5) {
    throw createProblem(409, "Loan limit exceeded", "A member cannot borrow more than 5 books at the same time.");
  }

  if (book.availableCopies <= 0) {
    throw createProblem(422, "Book unavailable", `Book '${bookId}' has no available copies.`);
  }

  const duplicateActiveLoan = activeLoans.find((loan) => loan.bookId === bookId);
  if (duplicateActiveLoan) {
    throw createProblem(409, "Duplicate active loan", "The member already has an active loan for this book.");
  }

  return { member, book };
}

function createLoan(memberId, bookId) {
  const { book } = ensureLoanable(memberId, bookId);

  const loan = {
    id: createId("loan"),
    memberId,
    bookId,
    status: "active",
    extended: false,
    loanDate: new Date().toISOString(),
    dueDate: createDueDate()
  };

  db.loans.push(loan);
  book.availableCopies -= 1;

  const reservation = db.reservations.find(
    (item) => item.memberId === memberId && item.bookId === bookId && item.status === "active"
  );

  if (reservation) {
    reservation.status = "fulfilled";
    reservation.fulfilledAt = new Date().toISOString();
  }

  return loan;
}

function returnLoan(loanId) {
  const loan = getLoanById(loanId);
  if (!loan) {
    throw createProblem(404, "Loan not found", `Loan '${loanId}' does not exist.`);
  }

  if (loan.status === "returned") {
    throw createProblem(409, "Loan already returned", `Loan '${loanId}' has already been returned.`);
  }

  loan.status = "returned";
  loan.returnedAt = new Date().toISOString();

  const book = getBookById(loan.bookId);
  if (book) {
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
  }

  return loan;
}

function extendLoan(loanId) {
  const loan = getLoanById(loanId);
  if (!loan) {
    throw createProblem(404, "Loan not found", `Loan '${loanId}' does not exist.`);
  }

  if (loan.status !== "active") {
    throw createProblem(409, "Loan is not active", `Loan '${loanId}' cannot be extended.`);
  }

  if (loan.extended) {
    throw createProblem(422, "Loan already extended", "A loan can only be extended once.");
  }

  loan.extended = true;
  loan.dueDate = new Date(new Date(loan.dueDate).getTime() + 14 * DAY_IN_MS).toISOString();
  return loan;
}

module.exports = {
  createLoan,
  ensureLoanable,
  extendLoan,
  getActiveLoansForMember,
  getBookById,
  getLoanById,
  getMemberById,
  returnLoan
};
