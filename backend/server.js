require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Book = require('./models/book');

const app = express();
app.use(express.json());
app.use(cors());

// 1. ADMIN ROUTE: Add a New Book
app.post('/books', async (req, res) => {
  try {
    const { title, author, publishYear } = req.body;
    if (!title || !author || !publishYear) {
      return res.status(400).send({ message: "Send all required fields: title, author, publishYear" });
    }
    const newBook = await Book.create({ title, author, publishYear });
    return res.status(201).send(newBook);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// 2. USER/ADMIN ROUTE: Get All Books
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find({});
    return res.status(200).json({
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database Connected");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.log(err));