const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userModel = require("./models/user-model");
require("dotenv").config();

// Connect to Database
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("Connected to MongoDB for User Seeding"))
.catch(err => console.log("Connection Error:", err));

async function seedUsers() {
    try {
        // Option A: Clear existing users (Uncomment if you want to wipe old users)
        // await userModel.deleteMany({}); 

        // 1. Hash the passwords
        const salt = await bcrypt.genSalt(10);
        const hash1 = await bcrypt.hash("test", salt);
        const hash2 = await bcrypt.hash("test2", salt);
        const hash3 = await bcrypt.hash("test3", salt);

        const users = [
            {
                fullname: "Vaibhav Verma",
                email: "vaibhavverma@gmail.com",
                password: hash1,
                contact: 9876543210,
                address: "Flat 402, Oakwood Apartments, Indiranagar, Bengaluru, Karnataka",
                pincode: 560038
            },
            {
                fullname: "Anmol Gupta",
                email: "anmolgupta@gmail.com",
                password: hash2,
                contact: 9123456789,
                address: "H.No 12, Block B, Greater Kailash 1, New Delhi",
                pincode: 110048
            },
            {
                fullname: "Abhishek Vohra",
                email: "abhishekvohra@gmail.com",
                password: hash3,
                contact: 8899776655,
                address: "15th Floor, Oberoi Springs, Andheri West, Mumbai, Maharashtra",
                pincode: 400053
            }
        ];

        await userModel.insertMany(users);
        console.log("✅ 3 Users created successfully!");
        
    } catch (error) {
        console.error("Error seeding users:", error);
    } finally {
        mongoose.connection.close();
    }
}

seedUsers();