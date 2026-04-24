const express = require("express");
const router = express.Router();

let loans = [];

router.post("/", (req, res) => {
    const { memberId, bookId } = req.body;

    const userLoans = loans.filter(l => l.memberId == memberId && !l.returned);

    // ❗ RULE
    if (userLoans.length >= 5) {
        return res.status(409).json({
            title: "Limit exceeded",
            status: 409
        });
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