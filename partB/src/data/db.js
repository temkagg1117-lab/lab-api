const DAY_IN_MS = 24 * 60 * 60 * 1000;

const db = {
  users: [
    { id: "admin-1", username: "admin", password: "admin123", role: "admin" },
    { id: "staff-1", username: "staff", password: "staff123", role: "staff" }
  ],
  books: [
    { id: "book-1", title: "Clean Code", author: "Robert C. Martin", category: "software", availableCopies: 3, totalCopies: 3 },
    { id: "book-2", title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "software", availableCopies: 2, totalCopies: 2 },
    { id: "book-3", title: "Design Patterns", author: "Erich Gamma", category: "software", availableCopies: 1, totalCopies: 1 },
    { id: "book-4", title: "Refactoring", author: "Martin Fowler", category: "software", availableCopies: 1, totalCopies: 1 },
    { id: "book-5", title: "Domain-Driven Design", author: "Eric Evans", category: "software", availableCopies: 1, totalCopies: 1 },
    { id: "book-6", title: "Working Effectively with Legacy Code", author: "Michael Feathers", category: "software", availableCopies: 1, totalCopies: 1 },
    { id: "book-7", title: "Peopleware", author: "Tom DeMarco", category: "management", availableCopies: 1, totalCopies: 1 }
  ],
  members: [
    { id: "member-1", name: "Anu", email: "anu@example.com", status: "active" },
    { id: "member-2", name: "Bilguun", email: "bilguun@example.com", status: "active" }
  ],
  loans: [],
  reservations: [],
  nextIds: {
    book: 8,
    member: 3,
    loan: 1,
    reservation: 1
  }
};

function createId(type) {
  const id = `${type}-${db.nextIds[type]++}`;
  return id;
}

function createDueDate(now = Date.now()) {
  return new Date(now + 14 * DAY_IN_MS).toISOString();
}

module.exports = {
  DAY_IN_MS,
  db,
  createDueDate,
  createId
};
