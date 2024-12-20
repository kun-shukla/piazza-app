const jsonwebtoken = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ message: "Access denied" });
  }
  try {
    const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;

    // Fetch username from the database
    const User = require("./models/User");
    User.findById(verified._id).then((user) => {
      if (!user) return res.status(404).send({ message: "User not found" });
      req.user.username = user.username; // Attach username to req.user
      next();
    });
  } catch (err) {
    return res.status(401).send({ message: "Invalid token" });
  }
}

module.exports = auth;
