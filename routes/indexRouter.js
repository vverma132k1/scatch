const express = require("express");
const router = express.Router();
const isloggedin = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const Razorpay = require("razorpay"); // Import Razorpay

// Initialize Razorpay with your Test Keys
const instance = new Razorpay({
    key_id: "rzp_test_RsMNddw4A5bhM9",     // Replace with actual Key ID
    key_secret: "htDeWNJtuA4uXDW1qv2L8tQS", // Replace with actual Key Secret
});


router.get("/", function (req, res) {
    let error = req.flash("error");
    res.render("index", { error, loggedin: false });
});

router.get("/shop", isloggedin, async function (req, res) {
    try {
        let success = req.flash("success");
        let error = req.flash("error");
        
        // 1. EXTRACT ALL QUERY PARAMETERS
        let { sortby, collection, filterby, search, minPrice, maxPrice, page } = req.query;
        
        // 2. DEFAULT VALUES
        page = Number(page) || 1;
        const limit = 10; // Items per page
        const skip = (page - 1) * limit;

        // 3. BUILD THE FILTER QUERY
        let query = {};
        
        // A. Search Logic (Regex for partial match, case-insensitive)
        if (search && search.trim().length > 0) {
            query.name = { $regex: search, $options: "i" };
        }

        // B. Price Logic
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // C. Collection Logic
        if (collection === "new") {
            let sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            query.createdAt = { $gte: sevenDaysAgo };
        } else if (collection === "discounted") {
            query.discount = { $gt: 0 };
        }

        // D. Availability Logic
        if (filterby === "available") {
            query.isAvailable = true;
            query.stock = { $gt: 0 };
        } 
        
        // 4. SORTING LOGIC
        let sortOption = { createdAt: -1 }; // Default: Newest first
        
        if (sortby === "popular") {
            sortOption = { views: -1 };
        } else if (sortby === "price_low") {
            sortOption = { price: 1 }; // Ascending
        } else if (sortby === "price_high") {
            sortOption = { price: -1 }; // Descending
        }

        // 5. FETCH DATA WITH PAGINATION
        // We need two queries: one for data, one for counting total items (for page numbers)
        const totalProducts = await productModel.countDocuments(query);
        const products = await productModel.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalProducts / limit);

        res.render("shop", { 
            products, 
            success,
            error,
            isShop: true,
            // Pass all filters back to EJS so we can keep inputs filled
            sortby: sortby || "newest",
            collection: collection || "all",
            filterby: filterby || "none",
            search: search || "",
            minPrice: minPrice || "",
            maxPrice: maxPrice || "",
            currentPage: page,
            totalPages,
            totalProducts
        });
        
    } catch (error) {
        console.error("Shop page error:", error);
        req.flash("error", "Error loading products.");
        res.redirect("/");
    }
});



// 1. REVISED CART ROUTE
router.get("/cart", isloggedin, async function (req, res) {
    try {
        let user = await userModel
            .findOne({ email: req.user.email })
            .populate("cart.productId"); // Populate the product details inside the cart object

        // Calculate Bills
        let totalMRP = 0;
        let totalDiscount = 0;
        
        // Filter out any null products (in case a product was deleted but remained in cart)
        user.cart = user.cart.filter(item => item.productId !== null);

        user.cart.forEach(item => {
            totalMRP += (Number(item.productId.price) * item.quantity);
            totalDiscount += (Number(item.productId.discount) * item.quantity);
        });

        let platformFee = 20;
        let shippingFee = totalMRP > 1000 ? 0 : 50; // Free shipping if over 1000 (example logic)
        let finalBill = (totalMRP - totalDiscount) + platformFee + shippingFee;

        res.render("cart", { 
            user, 
            bill: finalBill,
            totalMRP,
            totalDiscount,
            platformFee,
            shippingFee,
            isCart: true // <--- ADD THIS LINE
        });

    } catch (error) {
        console.error("Cart error:", error);
        res.status(500).send("Error fetching cart");
    }
});

// 1. ADD TO CART (Updated for AJAX)
router.get("/addtocart/:productid", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        let product = await productModel.findById(req.params.productid);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let cartItemIndex = user.cart.findIndex(item => item.productId.toString() === req.params.productid);
        let newQuantity = 1;

        if (cartItemIndex > -1) {  // Already in cart
            if (user.cart[cartItemIndex].quantity < product.stock) {
                user.cart[cartItemIndex].quantity += 1;
                newQuantity = user.cart[cartItemIndex].quantity;
            } else {
                // Stock limit reached
                if(req.xhr || req.headers.accept.indexOf('json') > -1){
                    return res.json({ success: false, message: "Out of stock" });
                }
                req.flash("error", "Out of stock");
                return res.redirect(req.get('referer') || '/shop');
            }
        } else {  // New Item
            if (product.stock > 0) {
                user.cart.push({ productId: product._id, quantity: 1 });
                newQuantity = 1;
            } else {
                if(req.xhr || req.headers.accept.indexOf('json') > -1){
                    return res.json({ success: false, message: "Out of stock" });
                }
                return res.redirect(req.get('referer') || '/shop');
            }
        }

        await user.save();

        // AJAX RESPONSE
        if(req.xhr || req.headers.accept.indexOf('json') > -1){
            return res.json({ success: true, quantity: newQuantity });
        }
        
        // Fallback for non-JS
        res.redirect(req.get('referer') || '/shop');

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 2. DECREASE QTY (Updated for AJAX)
router.get("/decreaseqty/:productid", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        let cartItemIndex = user.cart.findIndex(item => item.productId.toString() === req.params.productid);
        let newQuantity = 0;

        if (cartItemIndex > -1) {
            if (user.cart[cartItemIndex].quantity > 1) {
                user.cart[cartItemIndex].quantity -= 1;
                newQuantity = user.cart[cartItemIndex].quantity;
            } else {
                user.cart.splice(cartItemIndex, 1);
                newQuantity = 0;
            }
            await user.save();
        }

        // AJAX RESPONSE
        if(req.xhr || req.headers.accept.indexOf('json') > -1){
            return res.json({ success: true, quantity: newQuantity });
        }

        res.redirect(req.get('referer') || '/shop');
    } catch (error) {
        res.status(500).json({ success: false, message: "Error" });
    }
});

// POST: Verify Payment & Place Order
router.post("/api/payment/verify", isloggedin, async function (req, res) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // 1. Validate Signature (Security Check)
        const crypto = require("crypto");
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac("sha256", "htDeWNJtuA4uXDW1qv2L8tQS") // USE YOUR SECRET KEY
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // --- PAYMENT SUCCESSFUL ---
            // NOW we run the logic to save the order and clear the cart
            
            let user = await userModel.findOne({ email: req.user.email }).populate("cart.productId");
            
            let invoiceItems = [];
            let grandTotal = 0;

            // Process Cart
            for (let item of user.cart) {
                if(item.productId) {
                    let product = item.productId;
                    let finalPrice = Number(product.price) - Number(product.discount);
                    let itemTotal = finalPrice * item.quantity;
                    grandTotal += itemTotal;

                    // Deduct Stock
                    let productDoc = await productModel.findById(product._id);
                    if (productDoc) {
                        productDoc.stock -= item.quantity;
                        await productDoc.save();
                    }

                    invoiceItems.push({
                        productId: product._id,
                        name: product.name,
                        price: product.price,
                        discount: product.discount,
                        quantity: item.quantity,
                        finalPrice: finalPrice,
                        total: itemTotal
                    });
                }
            }
            
            // Add fees for record keeping
            const platformFee = 20;
            const shippingFee = grandTotal > 1000 ? 0 : 50;
            const finalAmount = grandTotal + platformFee + shippingFee;

            // Create Order Record
            const newOrder = {
                orderId: razorpay_order_id, // Use Razorpay ID
                paymentId: razorpay_payment_id,
                date: new Date(),
                items: invoiceItems,
                totalPaid: finalAmount
            };

            user.orders.push(newOrder);
            user.cart = []; // Clear Cart
            await user.save();

            // Send success response to frontend so it can redirect
            res.json({ success: true, url: "/checkout-success" });

        } else {
            res.json({ success: false, message: "Invalid Signature" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error verifying payment" });
    }
});

// Helper route to render the success page
router.get("/checkout-success", isloggedin, async function(req, res){
    // Just render the success page based on the last order
    let user = await userModel.findOne({ email: req.user.email });
    let lastOrder = user.orders[user.orders.length - 1]; // Get the newest order
    
    // Pass data to view
    res.render("success", { 
        user, 
        invoiceItems: lastOrder.items, 
        platformFee: 20, 
        shippingFee: lastOrder.totalPaid > 1000 ? 0 : 50, // rough logic for display
        finalAmount: lastOrder.totalPaid 
    });
});

// POST: Create Razorpay Order
router.post("/create/orderId", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("cart.productId");

        // 1. Calculate Total Amount again (Security check)
        let totalAmount = 0;
        user.cart.forEach(item => {
            if(item.productId){
                let price = Number(item.productId.price) - Number(item.productId.discount);
                totalAmount += (price * item.quantity);
            }
        });
        
        // Add fees
        totalAmount += 20; // Platform fee
        if (totalAmount <= 1000) totalAmount += 50; // Shipping

        // 2. Create Order Options
        var options = {
            amount: totalAmount * 100, // Amount is in PAISE (multiply by 100)
            currency: "INR",
            receipt: "order_rcptid_" + Date.now()
        };

        // 3. Call Razorpay
        const order = await instance.orders.create(options);
        
        // 4. Send Order ID to Frontend
        res.send(order);

    } catch (error) {
        console.log(error);
        res.status(500).send("Error creating order");
    }
});

// router.get("/logout", isloggedin, function (req, res) {
//     res.cookie("token", "");
//     res.redirect("/");
// });

module.exports = router;