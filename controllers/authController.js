const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Make sure jwt is required in the main app.js or here
const generateToken = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
    try {
        // ADDED contact here
        let { email, password, fullname, address, pincode, contact } = req.body; 
        
        let existingUser = await userModel.findOne({ email });
        if (existingUser) {
            req.flash("error", "User already registered.");
            return res.redirect("/");
        }

        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);

        let createdUser = await userModel.create({
            email, 
            password: hashedPassword, 
            fullname,
            address, 
            pincode,
            contact // SAVED contact here
        });

        let token = generateToken(createdUser); 
        res.cookie("token", token);
        res.redirect("/shop");
        
    } catch (err) {
        console.error(err.message);
        req.flash("error", "Error creating account");
        res.redirect("/");
    }
};

module.exports.loginUser = async function (req, res) {
    try {
        let { email, password } = req.body;

        let user = await userModel.findOne({ email: email });

        if (!user) {
            req.flash("error", "Email or Password incorrect.");
            return res.redirect("/");
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            let token = generateToken(user);
            res.cookie("token", token);
            // FIX: Redirect to shop instead of sending text
            res.redirect("/shop");
        } else {
            req.flash("error", "Email or Password incorrect.");
            return res.redirect("/");
        }

    } catch (err) {
        console.error("Login Error:", err.message);
        req.flash("error", "An unexpected error occurred.");
        return res.redirect("/");
    }
};

module.exports.logout = function (req, res) {
    // 1. Clear the 'token' cookie by setting its value to an empty string (and often setting it to expire immediately)
    res.cookie("token", ""); 

    // 2. Redirect the user to the home page or login page
    res.redirect("/");
};