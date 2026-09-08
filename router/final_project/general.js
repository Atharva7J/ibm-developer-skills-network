const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "Customer successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Task 1 & Task 10: Get all books using Promise / Axios
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    resolve(books);
  });
  getBooks.then((bks) => {
    res.status(200).send(JSON.stringify(bks, null, 4));
  });
});

// Task 2 & Task 11: Get book details based on ISBN using Promise / Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({status: 404, message: "Book not found"});
    }
  });
  getBook
    .then((bk) => res.status(200).json(bk))
    .catch((err) => res.status(err.status).json({message: err.message}));
});

// Task 3 & Task 12: Get book details based on author using Promise / Axios
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = new Promise((resolve, reject) => {
    let result = [];
    Object.keys(books).forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        result.push({
          isbn: key,
          author: books[key].author,
          title: books[key].title,
          reviews: books[key].reviews
        });
      }
    });
    resolve(result);
  });
  getBooksByAuthor.then((result) => res.status(200).json({booksbyauthor: result}));
});

// Task 4 & Task 13: Get all books based on title using Promise / Axios
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    let result = [];
    Object.keys(books).forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        result.push({
          isbn: key,
          title: books[key].title,
          author: books[key].author,
          reviews: books[key].reviews
        });
      }
    });
    resolve(result);
  });
  getBooksByTitle.then((result) => res.status(200).json({booksbytitle: result}));
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;
