module.exports = (err, req, res, next) => {
    res.status(err.status || 500).json({
        type: "about:blank",
        title: err.title || "Error",
        status: err.status || 500,
        detail: err.detail || ""
    });
};