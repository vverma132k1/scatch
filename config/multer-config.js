const multer = require("multer");

const storage = multer.memoryStorage(); // Corrected syntax

const upload = multer({ 
    storage: storage 
}); // Corrected syntax

module.exports = upload; // Corrected syntax