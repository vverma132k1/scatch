const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async function (req, res, next) {
    if (!req.cookies.token) {
        req.flash("error", "You need to login first."); 
        return res.redirect("/");
    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY); 

        let user = await userModel
            .findOne({ email: decoded.email }) 
            .select("-password");

        if (!user) {
            req.flash("error", "User not found. Please log in again.");
            res.clearCookie("token");
            return res.redirect("/");
        }

        req.user = user;
        next(); 

    } catch (err) {
        console.error("Authentication Error:", err.message);
        
        req.flash("error", "Session expired or invalid token. Please log in.");
        res.clearCookie("token");
        res.redirect("/");
    }
};