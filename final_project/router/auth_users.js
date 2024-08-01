const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    //write code to check is the username is valid
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    //write code to check if username and password match the one we have in records.
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
          data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
          accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    } 
    else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
    // return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!review) {
      return res.status(400).json({ message: 'No review has been submitted' });
    }

    // Check if the book exists in the database
    if (!books[isbn]) {
        return res.status(404).json({ message: `book with ISBN ${isbn} does not exist` });
    }

    // Check if the user has already reviewed the book
    if (books[isbn].reviews[username]) {
        // If the user has already reviewed the book, modify the existing review
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: `Review updated for book with ISBN ${isbn} by ${username}` });
    } else {
        // If the user has not reviewed the book, add a new review
        books[isbn].reviews[username] = review;
        return res.status(201).json({ message: `New Review added for book with ISBN ${isbn} by user ${username}` });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  
  
  const book = books[isbn];
  
  if (!book) {
    res.status(404).send(`The book with ISBN  ${isbn}  does not exist.`);
    return;
  }
  
  if (!book.reviews[username]) {
    res.status(404).send(`You have not posted any review for the book with ISBN  ${isbn}: ==>${JSON.stringify(book)}`);
    return;
  }
  
  delete book.reviews[username];
  res.send(`Your review has been deleted for the book with ${isbn} isbn: ==>${JSON.stringify(book)}`);

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
