const express = require("express");
const controller = require("../controllers/bookController");

module.exports = (auth, requireRole) => {
  const router = express.Router();

  router.get("/", controller.listBooks);
  router.get("/:id", controller.getBook);
  router.post("/", auth, requireRole("admin"), controller.createBook);

  return router;
};
