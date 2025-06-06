const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key"; // Change this to a secure key
const axios = require("axios");

public_users.get("/", async (req, res) => {
    try {
        const response = await axios.get("http://localhost:5000/books");
        res.status(200).json(response.data); // Return book list from the API
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

public_users.post("/customer/login", (req, res) => {
    const { username, password } = req.body;  // Extract username & password from request

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if user exists and password matches
    if (!users[username] || users[username].password !== password) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful!", token });
});

public_users.post('/customer/auth/reviews', (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract JWT token
    if (!token) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const username = decoded.username;
        const { isbn, review } = req.body;

        if (!isbn || !review) {
            return res.status(400).json({ message: "ISBN and review are required." });
        }

        // Check if the book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Add or modify review
        if (!books[isbn].reviews) {
            books[isbn].reviews = {}; // Initialize reviews object if missing
        }

        books[isbn].reviews[username] = review; // Add or update review by username

        res.status(200).json({ message: "Review added/updated successfully!", reviews: books[isbn].reviews });
    } catch (error) {
        res.status(403).json({ message: "Invalid token." });
    }
});

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;  // Extract username & password from request

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if user already exists
    if (users[username]) {
        return res.status(409).json({ message: "Username already exists. Choose another one." });
    }

    // Store new user
    users[username] = { password };
    res.status(201).json({ message: "User registered successfully!" });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;  // Extract ISBN from request URL
    const book = books[isbn];  // Look for the book using the numeric key

    if (book) {
        res.status(200).json(book);  // Return book details
    } else {
        res.status(404).json({ message: "Book not found" });  // Handle invalid ISBN lookup
    }
});

const axios = require("axios");

public_users.get("/isbn/:isbn", async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const response = await axios.get(`http://localhost:5000/books/${isbn}`);
        res.status(200).json(response.data); // Return book details from the API
    } catch (error) {
        res.status(404).json({ message: "Book not found", error: error.message });
    }
});

// Get book details based on author
const axios = require("axios");

public_users.get("/author/:author", async (req, res) => {
    const authorName = req.params.author;

    try {
        const response = await axios.get(`http://localhost:5000/books`);
        const booksData = response.data;
        const matchingBooks = Object.values(booksData).filter(book => book.author === authorName);

        if (matchingBooks.length > 0) {
            res.status(200).json(matchingBooks);
        } else {
            res.status(404).json({ message: "No books found for this author." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const bookTitle = req.params.title; // Extract title from request URL
    const matchingBooks = Object.values(books).filter(book => book.title === bookTitle); // Find books by title

    if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks); // Return books matching the title
    } else {
        res.status(404).json({ message: "No books found with this title." }); // Handle no matches
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;  // Extract ISBN from request URL
    const book = books[isbn];  // Find book using ISBN as key

    if (book) {
        res.status(200).json(book.reviews);  // Return reviews for the book
    } else {
        res.status(404).json({ message: "No reviews found for this ISBN or book does not exist." });  // Handle invalid ISBN
    }
});

module.exports.general = public_users;
