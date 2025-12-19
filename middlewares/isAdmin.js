const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

module.exports = async function (req, res, next) {
    // Prevent caching of protected pages
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    // Check if admin token exists
    if (!req.cookies.admintoken) {
        req.flash("error", "Admin access required. Please login.");
        return res.redirect("/owners/login");
    }

    try {
        // Verify the admin token
        let decoded = jwt.verify(req.cookies.admintoken, process.env.JWT_KEY);

        // Find the owner/admin
        let owner = await ownerModel
            .findOne({ email: decoded.email })
            .select("-password");

        if (!owner) {
            req.flash("error", "Admin not found. Please log in again.");
            res.clearCookie("admintoken");
            return res.redirect("/owners/login");
        }

        // Attach owner to request
        req.owner = owner;
        next();

    } catch (err) {
        console.error("Admin Authentication Error:", err.message);
        req.flash("error", "Invalid admin session. Please log in.");
        res.clearCookie("admintoken");
        res.redirect("/owners/login");
    }
};