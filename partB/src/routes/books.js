const express = require("express");
const router = express.Router();

let books = [];

router.get("/", (req, res) => {
    res.json(books);
});

router.post("/", (req, res) => {
    const book = {
        id: Date.now(),
        title: req.body.title
    };

    books.push(book);
    res.status(201).json(book);
});

router.get("/", (req, res) => {
    let { page = 1, limit = 5 } = req.query;

    const start = (page - 1) * limit;
    const data = books.slice(start, start + parseInt(limit));

    res.json({
        data,
        total: books.length
    });
});

module.exports = router;