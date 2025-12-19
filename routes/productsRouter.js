const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isAdmin = require("../middlewares/isAdmin");
const Vibrant = require('node-vibrant/node');

// Create product
router.post("/create", isAdmin, upload.single("image"), async function (req, res) {
    try {
        let { name, price, discount, stock, isAvailable } = req.body;
        
        if (!req.file) {
            req.flash("error", "No image file uploaded.");
            return res.redirect("/owners/create-product");
        }

        // --- DYNAMIC COLOR LOGIC START ---
        // We extract a palette from the image buffer
        const palette = await Vibrant.from(req.file.buffer).getPalette();
        
        // Strategy: 
        // Background: Lightest color found (LightVibrant or LightMuted)
        // Panel: A slightly darker/vibrant color
        // Text: Darkest color for contrast
        
        // Fallback colors if detection fails
        let bgcolor = palette.LightVibrant ? palette.LightVibrant.getHex() : "#f3f4f6"; // Light Gray
        let panelcolor = palette.DarkVibrant ? palette.DarkVibrant.getHex() : "#1f2937"; // Dark Gray
        let textcolor = palette.LightMuted ? palette.LightMuted.getHex() : "#ffffff"; // White
        
        // --- DYNAMIC COLOR LOGIC END ---

        let product = await productModel.create({
            image: req.file.buffer,
            name,
            price: Number(price),
            discount: Number(discount) || 0,
            stock: Number(stock) || 10,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            
            // Save the auto-generated colors
            bgcolor,
            panelcolor,
            textcolor,
        });
        
        req.flash("success", "Product created successfully!");
        res.redirect("/owners/admin");

    } catch (error) {
        console.error("Product Creation Error:", error);
        req.flash("error", "Error creating product: " + error.message);
        res.redirect("/owners/create-product");
    }
});

// Update product
router.post("/edit/:id", isAdmin, upload.single("image"), async function (req, res) {
    try {
        let { name, price, discount, bgcolor, panelcolor, textcolor, stock, isAvailable } = req.body;
        
        let updateData = {
            name,
            price: Number(price),
            discount: Number(discount) || 0,
            bgcolor,
            panelcolor,
            textcolor,
            stock: Number(stock) || 10,
            isAvailable: isAvailable === 'true' || isAvailable === true
        };

        // Only update image if a new one is uploaded
        if (req.file) {
            updateData.image = req.file.buffer;
        }

        await productModel.findByIdAndUpdate(req.params.id, updateData);
        
        req.flash("success", "Product updated successfully!");
        res.redirect("/owners/admin");

    } catch (error) {
        console.error("Product Update Error:", error);
        req.flash("error", "Error updating product: " + error.message);
        res.redirect("/owners/edit-product/" + req.params.id);
    }
});

module.exports = router;