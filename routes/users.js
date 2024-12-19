const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("You viewing all users");
});

router.get("/:username", (req, res) => {
  res.send(`Welcome to ${req.params.username}'s profile page!`);
});

module.exports = router;
