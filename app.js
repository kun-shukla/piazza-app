// Import libraries
const express = require("express");
const app = express();

const mongoose = require("mongoose");
require("dotenv/config");

const bodyParser = require("body-parser");
const postsRoute = require("./routes/posts");
// const userRoute = require("./routes/users");

// Middleware
app.use(bodyParser.json());
app.use("/posts", postsRoute);
// app.use("/users", userRoute);

//Create a route
app.get("/", (req, res) => {
  res.send("Welcome to the Piazza homepage");
});

mongoose.connect(process.env.DB_CONNECTOR).then(() => {
  console.log("Your MongoDB connector is running...");
});

//Start the server
app.listen(3000, () => {
  console.log("Piazza server is up and running...");
});