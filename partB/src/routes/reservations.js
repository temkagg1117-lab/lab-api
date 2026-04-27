const express = require("express");
const controller = require("../controllers/reservationController");

const router = express.Router();

router.get("/", controller.listReservations);
router.post("/", controller.createReservation);
router.delete("/:id", controller.cancelReservation);

module.exports = router;
