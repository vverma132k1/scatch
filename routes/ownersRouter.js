
const express = require("express");
const router = express.Router();
const { createOwner, loginOwner, logoutOwner } = require("../controllers/adminController");
const isAdmin = require("../middlewares/isAdmin");
const productModel = require("../models/product-model");

// router.get("/", function (req, res) {
//     res.send("hey it's working");
// });


// router.get("/admin", function(req, res){
//     let success = req.flash("success");
//     let error = req.flash("error");
//     res.render("createproducts", { success, error }); 
// })

// Admin login page
router.get("/login", function (req, res) {
    let error = req.flash("error");
    let success = req.flash("success");
    res.render("owner-login", { error, success });
});

// Admin login POST
router.post("/login", loginOwner);

// Admin logout
router.get("/logout", isAdmin, logoutOwner);

// Create owner (only in development mode)
// if (process.env.NODE_ENV === "development") {
//     router.post("/create", createOwner);
// }

router.post("/create", createOwner);

// Admin dashboard - View all products
router.get("/admin", isAdmin, async function (req, res) {
    try {
        let products = await productModel.find();
        let success = req.flash("success");
        let error = req.flash("error");
        // ADDED: isAdmin: true
        res.render("admin", { products, success, error, isAdmin: true }); 
    } catch (err) {
        console.error("Error fetching products:", err);
        req.flash("error", "Error loading products.");
        res.render("admin", { products: [], success: "", error: req.flash("error") });
    }
});

// Create product page
router.get("/create-product", isAdmin, function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    // ADDED: isAdmin: true
    res.render("createproducts", { success, error, isAdmin: true });
});

// Edit product page
router.get("/edit-product/:id", isAdmin, async function (req, res) {
    try {
        let product = await productModel.findById(req.params.id);
        if (!product) {
            req.flash("error", "Product not found.");
            return res.redirect("/owners/admin");
        }
        let error = req.flash("error");
        res.render("editproduct", { product, error, isAdmin: true });
    } catch (err) {
        console.error("Error fetching product:", err);
        req.flash("error", "Error loading product.");
        res.redirect("/owners/admin");
    }
});

// Delete product
router.get("/delete-product/:id", isAdmin, async function (req, res) {
    try {
        await productModel.findByIdAndDelete(req.params.id);
        req.flash("success", "Product deleted successfully!");
        res.redirect("/owners/admin");
    } catch (err) {
        console.error("Error deleting product:", err);
        req.flash("error", "Error deleting product.");
        res.redirect("/owners/admin");
    }
});

module.exports = router;