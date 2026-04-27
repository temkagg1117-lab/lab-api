const express = require("express");
const controller = require("../controllers/memberController");

module.exports = (auth, requireRole) => {
  const router = express.Router();

  router.get("/", controller.listMembers);
  router.get("/:id", controller.getMember);
  router.post("/", auth, requireRole("admin", "staff"), controller.createMember);

  return router;
};
