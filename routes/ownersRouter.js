
const express = require("express");
const router = express.Router();
const { createOwner, loginOwner, logoutOwner } = require("../controllers/adminController");
const isAdmin = require("../middlewares/isAdmin");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model"); 

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

// important route. 
// Hide it when not in use. 
// router.post("/create", createOwner);

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

// GET: Admin Order Dashboard
router.get("/admin/orders", async function (req, res) {
    try {
        // 1. Find users who have at least one order
        // "orders.0" checks if the 0th index exists (array is not empty)
        const users = await userModel.find({ "orders.0": { $exists: true } });

        // 2. Flatten the data: Extract orders from users into one big array
        let allOrders = [];
        
        users.forEach(user => {
            user.orders.forEach(order => {
                allOrders.push({
                    _id: order._id,
                    orderId: order.orderId,
                    paymentId: order.paymentId,
                    amount: order.totalPaid,
                    date: order.date,
                    items: order.items,
                    // We attach customer details to the order object here
                    customerName: user.fullname,
                    customerEmail: user.email,
                    customerContact: user.contact,
                    customerAddress: user.address
                });
            });
        });

        // 3. Sort by Date (Newest First)
        allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 4. Render
        res.render("admin-orders", { orders: allOrders });

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;