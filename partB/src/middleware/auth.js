module.exports = (req, res, next) => {
    const auth = req.headers.authorization;

    if (!auth) {
        return res.status(401).json({ title: "Unauthorized" });
    }

    next();
};