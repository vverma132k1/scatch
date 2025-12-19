const express = require("express");
const router = express.Router();
const {registerUser, loginUser, logout} = require("../controllers/authController"); 
const userModel = require("../models/user-model");
const isLoggedIn = require("../middlewares/isLoggedIn");
const upload = require("../config/multer-config");

// Secret key for JWT (This should be stored securely in a .env file!)
// const jwtSecret = "shhhhhh"; // Using the placeholder secret from your previous context

// GET / route
// router.get("/", function (req, res) {
//     res.send("hey it's working");
// });

// POST /register route with bcrypt hashing and JWT creation
router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", logout);

// NEW: My Account Route
router.get("/account", isLoggedIn, async function(req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        // ADDED: hideAccountBtn: true
        res.render("myaccount", { user, hideAccountBtn: true });
    } catch(err) {
        console.log(err);
        res.redirect("/shop");
    }
});

// 1. GET Edit Profile Page
router.get("/edit-profile", isLoggedIn, async function(req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        res.render("editprofile", { user, hideAccountBtn: true });
    } catch(err) {
        res.redirect("/users/account");
    }
});

// 2. POST Update Profile
// Add upload.single("image") middleware
router.post("/update-profile", isLoggedIn, upload.single("image"), async function(req, res) {
    try {
        let { fullname, contact, address, pincode } = req.body;
        
        let updateData = {
            fullname,
            contact,
            address,
            pincode
        };

        // If a file was uploaded, add it to updateData
        if (req.file) {
            updateData.picture = req.file.buffer;
        }
        
        await userModel.findOneAndUpdate(
            { email: req.user.email },
            updateData
        );
        
        req.flash("success", "Profile updated successfully");
        res.redirect("/users/account");
        
    } catch(err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/users/account");
    }
});

module.exports = router;