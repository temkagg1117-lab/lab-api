const express = require("express");
const router = express.Router();

let loans = [];


// 📌 1. Ном зээлэх
router.post("/", (req, res) => {
    const { memberId, bookId } = req.body;

    const userLoans = loans.filter(l => l.memberId == memberId && !l.returned);

    if (userLoans.length >= 5) {
        return res.status(409).json({ title: "Limit exceeded" });
    }

    const loan = {
        id: Date.now(),
        memberId,
        bookId,
        returned: false,
        extended: false,
        dueDate: Date.now() + 14 * 24 * 60 * 60 * 1000
    };

    loans.push(loan);

    res.status(201).json(loan);
});

router.post("/:id/return", (req, res) => {
    const loan = loans.find(l => l.id == req.params.id);

    if (!loan) return res.status(404).json({ title: "Not found" });

    loan.returned = true;

    res.json(loan);
});

router.post("/:id/extend", (req, res) => {
    const loan = loans.find(l => l.id == req.params.id);

    if (!loan) return res.status(404).json({ title: "Not found" });

    if (loan.extended) {
        return res.status(422).json({ title: "Already extended" });
    }

    loan.extended = true;
    loan.dueDate += 14 * 24 * 60 * 60 * 1000;

    res.json(loan);
});


module.exports = router;