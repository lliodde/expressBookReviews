const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.post("/customer/login", (req, res) => {
    const { username, password } = req.body;

    // Authenticate user (replace with real validation logic)
    if (username === "test" && password === "password") {
        const token = jwt.sign({ username }, "your_secret_key", { expiresIn: "1h" });

        // Store token in session
        req.session.token = token;
        res.json({ message: "Login successful!", token });
    } else {
        res.status(401).json({ message: "Invalid credentials." });
    }
});

app.use("/customer/auth/*", function auth(req,res,next){
    // Check if session exists
    if (!req.session.token) {
        return res.status(401).json({ message: "Unauthorized access. Please log in." });
    }

    // Verify JWT token
    jwt.verify(req.session.token, "your_secret_key", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        
        // Attach user info to request
        req.user = user;
        next();
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
