const express = require('express');
const app = express();

app.use(express.json());
const books = [];

app.get ("/get_book" , async (req , res) =>{
    res.status(400).json({msg:"add the book broo"})

})

app.post ("/post_books" ,async (req , res) => {
    const {tittle, price, author, ratings} = req.body;
    if (!tittle|| !author|| !price|| !ratings) {
        return res.status(400).json({msg:"please provide all books details", books});
    }
    const newBook = {tittle, price, author, ratings};
    books.push(newBook);
    return res.status(201).json({msg:"books are added to the cart", books})

    app.get("/search_books", async (req, res) => {
    // 1. Get the title from the query parameters
    const { tittle } = req.query;

    // 2. Check if there are no books at all FIRST
    if (books.length === 0) {
        return res.status(200).json({ msg: "no books in the library yet , soo add some books", data: [] });
    }

    // 3. Search through the 'books' array carefully using a clean variable name 'item'
    const foundBook = books.find((item) => item.tittle.toLowerCase() === tittle.toLowerCase());

    // 4. If the book wasn't found, return a 404 with a clear message
    if (!foundBook) {
        return res.status(404).json({ msg: "book not found broo", books });
    } 

    // 5. Success! Return the fixed 'status' and the found book
    return res.status(200).json({ msg: "searched books are found ", book: foundBook });
});
});

app.delete("/deleted_books", async(req, res) => {
    const { tittle } = req.body;
    const bookexist = books.find((somebooks) => somebooks.books.toLowercase());
     if(!bookexist) {
        return res.status(200).json({msg:"book is deleted by the admin", books});
     }
     return res.status(400).json({msg:"selected book is not deleted"});

})

let port = 4000;
app.listen(port , () =>{
    console.log("server successfully running on port" , port, "broo");
})

