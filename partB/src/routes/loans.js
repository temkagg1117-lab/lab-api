const express = require("express");
const controller = require("../controllers/loanController");

const router = express.Router();

router.get("/", controller.listLoans);
router.get("/:id", controller.getLoan);
router.post("/", controller.createLoan);
router.post("/:id/return", controller.returnLoan);
router.post("/:id/extend", controller.extendLoan);

module.exports = router;
