const mongoose = require('mongoose');
const Book = require('./models/Book');
require('dotenv').config();

const books = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", publishYear: 1925 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", publishYear: 1960 },
  { title: "1984", author: "George Orwell", publishYear: 1949 },
  { title: "Harry Potter", author: "J.K. Rowling", publishYear: 1997 },
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Book.insertMany(books);
  console.log('Books added!');
  mongoose.connection.close();
});