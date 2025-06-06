const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract JWT token
    if (!token) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const username = decoded.username;
        const { isbn } = req.params;

        // Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Check if the user has a review on the book
        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(403).json({ message: "You have no review to delete for this book." });
        }

        // Delete user's review
        delete books[isbn].reviews[username];

        res.status(200).json({ message: "Review deleted successfully!", reviews: books[isbn].reviews });
    } catch (error) {
        res.status(403).json({ message: "Invalid token." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
