const express = require("express");
const app = express();

app.use(express.json());

app.listen(3000, () => {
    console.log("Server running on 3000");
});

app.use("/books", require("./routes/books"));

app.use("/loans", require("./routes/loans"));

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);