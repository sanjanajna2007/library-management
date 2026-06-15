const express = require("express");

const app = express();

const hostname = "127.0.0.1";
const port = 5000;

app.get("/", (req, res) => {
   
    res.end("hello world");

});

app.listen(port, hostname, () => {
   console.log("server is running on this port://${hostname}:${port}/");
} )