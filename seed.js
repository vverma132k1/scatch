const mongoose = require("mongoose");
const productModel = require("./models/product-model");
const fs = require("fs");
const path = require("path");


// 1. CONNECT TO DB (Check your app.js for the exact URI!)
// It's usually "mongodb://127.0.0.1:27017/scatch" or your Atlas link
// mongoose.connect("mongodb://127.0.0.1:27017/scatch")
mongoose.connect("mongodb+srv://vverma01_db_user_new:uwuw@cluster0.lcjagmp.mongodb.net/?appName=Cluster0")

.then(() => console.log("Connected to MongoDB for seeding"))
.catch(err => console.log("Connection Error:", err));

// 2. READ THE PLACEHOLDER IMAGE
const imageBuffer = fs.readFileSync(path.join(__dirname, "bag.jpg"));

// 3. THE DATA LIST
const products = [
    // Luxury Collection
    { name: "The Royal Obsidian Tote", price: 5499, discount: 1500, stock: 10, bgcolor: "#000000", panelcolor: "#222222", textcolor: "#ffffff" },
    { name: "Vintage Tan Satchel", price: 4200, discount: 800, stock: 5, bgcolor: "#8B4513", panelcolor: "#A0522D", textcolor: "#ffffff" },
    { name: "Scarlet Evening Clutch", price: 2800, discount: 0, stock: 12, bgcolor: "#800000", panelcolor: "#A52A2A", textcolor: "#ffffff" },
    { name: "Ivory Quilted Crossbody", price: 3500, discount: 500, stock: 8, bgcolor: "#FFFFF0", panelcolor: "#F5F5DC", textcolor: "#000000" },

    // Everyday Series
    { name: "Urban Grey Messenger", price: 1899, discount: 200, stock: 15, bgcolor: "#808080", panelcolor: "#A9A9A9", textcolor: "#000000" },
    { name: "Boho Fringe Sling", price: 1450, discount: 0, stock: 7, bgcolor: "#D2691E", panelcolor: "#CD853F", textcolor: "#ffffff" },
    { name: "Ocean Blue Hobo", price: 2100, discount: 600, stock: 4, bgcolor: "#1E90FF", panelcolor: "#4682B4", textcolor: "#ffffff" },
    { name: "Minimalist Laptop Sleeve", price: 2500, discount: 1000, stock: 20, bgcolor: "#191970", panelcolor: "#000080", textcolor: "#ffffff" },

    // Budget Collection
    { name: "Sunshine Mini Tote", price: 999, discount: 100, stock: 25, bgcolor: "#FFD700", panelcolor: "#FFA500", textcolor: "#000000" },
    { name: "Eco Jute Shopper", price: 599, discount: 50, stock: 0, bgcolor: "#F5DEB3", panelcolor: "#DEB887", textcolor: "#000000" }, // Out of stock test
    { name: "Neon Green Belt Bag", price: 1200, discount: 400, stock: 10, bgcolor: "#32CD32", panelcolor: "#228B22", textcolor: "#ffffff" },
    { name: "Floral Canvas Weekender", price: 1500, discount: 300, stock: 3, bgcolor: "#FF69B4", panelcolor: "#C71585", textcolor: "#ffffff" }, // Low stock test

    { name: "Crimson Velvet Clutch", price: 3200, discount: 400, stock: 8, bgcolor: "#800020", panelcolor: "#660016", textcolor: "#ffffff" },
    { name: "Midnight Blue Duffel", price: 2100, discount: 0, stock: 15, bgcolor: "#191970", panelcolor: "#000080", textcolor: "#ffffff" },
    { name: "Blush Pink Crossbody", price: 1800, discount: 200, stock: 5, bgcolor: "#FFC0CB", panelcolor: "#FFB6C1", textcolor: "#000000" }
];

// 4. INSERT FUNCTION
async function seedDB() {
    try {
        // Optional: Clear existing products first? Uncomment next line if you want that.
        // await productModel.deleteMany({}); 

        for (let prod of products) {
            await productModel.create({
                name: prod.name,
                price: prod.price,
                discount: prod.discount,
                stock: prod.stock,
                image: imageBuffer, // Uses the same image for all
                bgcolor: prod.bgcolor,
                panelcolor: prod.panelcolor,
                textcolor: prod.textcolor
            });
            console.log(`Created: ${prod.name}`);
        }
        console.log("✅ All products seeded successfully!");
        mongoose.connection.close(); // Close connection when done
    } catch (error) {
        console.error("Error seeding:", error);
    }
}

// Run it
seedDB();