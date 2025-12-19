const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const db = require("./config/mongoose-connection")
const indexRouter = require("./routes/indexRouter");
const ownersRouter = require("./routes/ownersRouter");
const productsRouter = require("./routes/productsRouter");
const usersRouter = require("./routes/usersRouter");
// const index = require("./routes/indexRouter");
const ejs = require("ejs"); 
const flash = require("connect-flash"); 
const expressSession = require("express-session"); 

require("dotenv").config(); 


app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET, // Corrected syntax for accessing environment variable
    })
);

app.use(flash()); 

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); 
app.set("view engine", "ejs");  



const userModel = require("./models/user-model"); // Import user model
const jwt = require("jsonwebtoken");

app.use(async function (req, res, next) {
  res.locals.loggedin = false; // Default
  res.locals.user = null;      // Default

  if (req.cookies.token) {
    try {
      let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
      let user = await userModel.findById(decoded.id).select("-password");
      
      if (user) {
        res.locals.loggedin = true;
        res.locals.user = user; // Now <%= user.fullname %> works in all EJS files
      }
    } catch (err) {
      // Token invalid
    }
  }
  next();
});

// Route
// app.get("/", (req, res) => { 
//     res.send("hey");
// });



app.use("/", indexRouter); 
app.use("/users", usersRouter); 
app.use("/owners", ownersRouter); 
app.use("/products", productsRouter); 

// Server listener
// app.listen(3000, () => {
//     console.log("Server listening on port 3000"); // Added console log for confirmation
// });

// Render provides a port in process.env.PORT. If not found, use 3000.
app.listen(process.env.PORT || 3000);