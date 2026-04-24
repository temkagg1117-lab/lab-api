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

module.exports = router;