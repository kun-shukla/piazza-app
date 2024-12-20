// Import libraries
const express = require("express");
const app = express();

const mongoose = require("mongoose");
require("dotenv/config");

const bodyParser = require("body-parser");
const postsRoute = require("./routes/posts");
const authRoute = require("./routes/auth");

// Middleware
app.use(bodyParser.json());
app.use("/api/posts", postsRoute);
app.use("/api/user", authRoute);

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
