const express = require("express");
const auth = require("./middleware/auth");
const { requireRole } = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");
const { db } = require("./data/db");
const { createProblem } = require("./utils/problem");

const app = express();

app.use(express.json());

app.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  const user = db.users.find((item) => item.username === username && item.password === password);

  if (!user) {
    return next(createProblem(401, "Unauthorized", "Invalid username or password."));
  }

  return res.json({
    accessToken: user.username,
    tokenType: "Bearer",
    role: user.role
  });
});

app.use("/books", require("./routes/books")(auth, requireRole));
app.use("/members", require("./routes/members")(auth, requireRole));
app.use("/loans", auth, require("./routes/loans"));
app.use("/reservations", auth, require("./routes/reservations"));

app.use((req, res, next) => {
  next(createProblem(404, "Not found", `Route '${req.originalUrl}' does not exist.`));
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Library Lending API running on port 3000");
  });
}

module.exports = app;
