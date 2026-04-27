const { db, createId } = require("../data/db");
const { createProblem } = require("../utils/problem");
const { applyFiltering, applySorting, paginate } = require("../utils/query");

function listBooks(req, res) {
  const filtered = applyFiltering(db.books, req.query, ["title", "author", "category"]);
  const sorted = applySorting(filtered, req.query.sortBy, req.query.sortOrder, [
    "title",
    "author",
    "category",
    "availableCopies",
    "totalCopies"
  ]);

  res.json(paginate(sorted, req.query));
}

function getBook(req, res, next) {
  const book = db.books.find((item) => item.id === req.params.id);
  if (!book) {
    return next(createProblem(404, "Book not found", `Book '${req.params.id}' does not exist.`));
  }

  return res.json(book);
}

function createBook(req, res, next) {
  const { title, author, category, totalCopies } = req.body;

  if (!title || !author || !category || !Number.isInteger(totalCopies) || totalCopies < 1) {
    return next(
      createProblem(400, "Invalid book payload", "title, author, category and totalCopies >= 1 are required.")
    );
  }

  const book = {
    id: createId("book"),
    title,
    author,
    category,
    totalCopies,
    availableCopies: totalCopies
  };

  db.books.push(book);
  return res.status(201).json(book);
}

module.exports = {
  createBook,
  getBook,
  listBooks
};
