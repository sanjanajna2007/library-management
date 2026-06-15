const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/usermodel');
const jwt = require('jsonwebtoken');
 
const JWT_SECRET = "supersecretlibrarykey123";
 
// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: "No token provided" });
 
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
 
// 1. ROUTE: Add a new book
router.post('/add', async (req, res) => {
  try {
    const { title, author, publishYear } = req.body;
    const newBook = new Book({ title, author, publishYear });
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
 
// 2. ROUTE: Get all books
router.get('/all', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
 
// 3. ROUTE: Update a book
router.put('/update/:id', async (req, res) => {
  try {
    const { title, author, publishYear } = req.body;
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, publishYear },
      { returnDocument: 'after' }
    );
    if (!updatedBook) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
 
// 4. ROUTE: Delete a book
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
 
// 5. ROUTE: Buy a book (User)
router.post('/buy/:id', verifyToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
 
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
 
    // Check if already purchased
    if (user.purchasedBooks.includes(req.params.id)) {
      return res.status(400).json({ message: "You already bought this book" });
    }
 
    user.purchasedBooks.push(req.params.id);
    await user.save();
 
    res.status(200).json({ message: "Book bought successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
 
// 6. ROUTE: Return a book (User)
router.post('/return/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
 
    user.purchasedBooks = user.purchasedBooks.filter(
      (bookId) => bookId.toString() !== req.params.id
    );
    await user.save();
 
    res.status(200).json({ message: "Book returned successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
 
// 7. ROUTE: Get user's purchased books
router.get('/mybooks', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('purchasedBooks');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.purchasedBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
 
module.exports = router;