const { db, createId } = require("../data/db");
const loanService = require("../services/loanService");
const { createProblem } = require("../utils/problem");
const { applyFiltering, applySorting, paginate } = require("../utils/query");

function listReservations(req, res) {
  const filtered = applyFiltering(db.reservations, req.query, ["memberId", "bookId", "status"]);
  const sorted = applySorting(filtered, req.query.sortBy, req.query.sortOrder, [
    "reservedAt",
    "memberId",
    "bookId",
    "status"
  ]);

  res.json(paginate(sorted, req.query));
}

function createReservation(req, res, next) {
  const { memberId, bookId } = req.body;
  if (!memberId || !bookId) {
    return next(createProblem(400, "Invalid reservation payload", "memberId and bookId are required."));
  }

  try {
    loanService.ensureLoanable(memberId, bookId);
    return next(
      createProblem(409, "Reservation not needed", "This book is available now, so it should be borrowed directly.")
    );
  } catch (error) {
    if (error.status !== 422) {
      return next(error);
    }
  }

  const existing = db.reservations.find(
    (item) => item.memberId === memberId && item.bookId === bookId && item.status === "active"
  );
  if (existing) {
    return next(createProblem(409, "Reservation already exists", "An active reservation already exists."));
  }

  const reservation = {
    id: createId("reservation"),
    memberId,
    bookId,
    status: "active",
    reservedAt: new Date().toISOString()
  };

  db.reservations.push(reservation);
  return res.status(201).json(reservation);
}

function cancelReservation(req, res, next) {
  const reservation = db.reservations.find((item) => item.id === req.params.id);
  if (!reservation) {
    return next(createProblem(404, "Reservation not found", `Reservation '${req.params.id}' does not exist.`));
  }

  if (reservation.status !== "active") {
    return next(createProblem(409, "Reservation is not active", `Reservation '${req.params.id}' cannot be cancelled.`));
  }

  reservation.status = "cancelled";
  reservation.cancelledAt = new Date().toISOString();
  return res.status(204).send();
}

module.exports = {
  cancelReservation,
  createReservation,
  listReservations
};
