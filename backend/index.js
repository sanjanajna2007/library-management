const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "supersecretlibrarykey123";

// ==========================================
// DATABASE CONNECTION
// ==========================================
mongoose.connect('mongodb+srv://sanjana:library123@cluster0.flpjt4h.mongodb.net/library?appName=Cluster0')
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// ==========================================
// SCHEMAS
// ==========================================
const BookSchema = new mongoose.Schema({
  name: String,
  author: String,
  publishYear: Number,
});
const Book = mongoose.model('Book', BookSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});
const User = mongoose.model('User', UserSchema);

// ==========================================
// AUTH ROUTES
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword, role: 'user' });
    await newUser.save();
    res.status(201).json({ message: "Registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// BOOK ROUTES
// ==========================================

// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add book
app.post('/api/books', async (req, res) => {
  try {
    const newBook = new Book({
      name: req.body.name,
      author: req.body.author,
      publishYear: req.body.publishYear
    });
    const savedBook = await newBook.save();
    res.json(savedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update book
app.put('/api/books/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, author: req.body.author, publishYear: Number(req.body.publishYear) },
      { new: true }
    );
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete book
app.delete('/api/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my purchased books
app.get('/api/books/mybooks', async (req, res) => {
  try {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).populate('purchasedBooks');
    res.status(200).json(user.purchasedBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buy book
app.post('/api/books/buy/:id', async (req, res) => {
  try {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user.purchasedBooks.includes(req.params.id)) {
      return res.status(400).json({ message: "Already bought this book" });
    }
    user.purchasedBooks.push(req.params.id);
    await user.save();
    res.status(200).json({ message: "Book bought successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Return book
app.post('/api/books/return/:id', async (req, res) => {
  try {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    user.purchasedBooks = user.purchasedBooks.filter(id => id.toString() !== req.params.id);
    await user.save();
    res.status(200).json({ message: "Book returned successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get total users count
app.get('/api/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// START SERVER
// ==========================================
app.listen(5000, () => console.log("Server running on port 5000"));