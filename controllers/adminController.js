const ownerModel = require("../models/owner-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Create the first admin (one-time setup - only in development)
module.exports.createOwner = async function (req, res) {
    try {
        // Check if any owner already exists
        let owners = await ownerModel.find();
        // if (owners.length > 0) {
        //     return res.status(403).send("An owner already exists. Cannot create another.");
        // }

        let { fullname, email, password } = req.body;

        // Hash password
        let salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);

        // Create owner
        let owner = await ownerModel.create({
            fullname,
            email,
            password: hashedPassword
        });

        res.status(201).send("Owner created successfully!");

    } catch (err) {
        console.error("Owner creation error:", err);
        res.status(500).send("Error creating owner: " + err.message);
    }
};

// Admin login
module.exports.loginOwner = async function (req, res) {
    try {
        let { email, password } = req.body;

        // Find owner by email
        let owner = await ownerModel.findOne({ email });

        if (!owner) {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/owners/login");
        }

        // Compare passwords
        const match = await bcrypt.compare(password, owner.password);

        if (match) {
            // Generate admin token
            let token = jwt.sign(
                { email: owner.email, id: owner._id },
                process.env.JWT_KEY
            );

            res.cookie("admintoken", token);
            req.flash("success", "Welcome back, Admin!");
            res.redirect("/owners/admin");
        } else {
            req.flash("error", "Invalid email or password.");
            res.redirect("/owners/login");
        }

    } catch (err) {
        console.error("Admin login error:", err);
        req.flash("error", "An error occurred during login.");
        res.redirect("/owners/login");
    }
};


// Admin logout
module.exports.logoutOwner = function (req, res) {
    // Clear the cookie
    res.cookie("admintoken", "", {
        httpOnly: true,
        expires: new Date(0) // Set expiry to past date
    });
    
    // Prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    req.flash("success", "Logged out successfully!");
    res.redirect("/owners/login");
};