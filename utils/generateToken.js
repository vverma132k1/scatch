const jwt = require("jsonwebtoken"); // You need this line to use jwt

const generateToken = (user) => {
    // Corrected: Uses the standard 'return' keyword and curly braces for the function body
    return jwt.sign({ 
        email: user.email, 
        id: user._id 
    }, process.env.JWT_KEY);
};

// Corrected: Uses the standard export syntax
module.exports = generateToken;