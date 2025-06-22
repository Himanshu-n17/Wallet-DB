const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Expected format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Token missing from header" });
  }

  try {
    console.log(token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // you can access user ID or role from this
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
