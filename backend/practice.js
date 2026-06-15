const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

app.use(express.json());


mongoose.connect("mongodb://localhost:27017/authdb")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Error in database connection:", err));


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema); 


app.get("/", (req, res) => {
  res.status(200).json({ msg: "login" });
});


app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
  
    const hashedPassword = await bcrypt.hash(password, 10);
    
  
    const newUser = new User({
      email,
      password: hashedPassword
    });
    

    await newUser.save();
    
    return res.status(200).json({ msg: "signup successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "something internal error" });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(400).json({ msg: "email not found" });
    }

    
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ msg: "invalid password" });
    }

    return res.status(200).json({ msg: "logged in successfully" });
  } catch (error) {
    return res.status(500).json({ msg: "something internal error" });
  }
});

 app.listen(3000, () => console.log("This server is running on port no 3000"));