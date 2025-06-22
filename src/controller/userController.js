const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
} = require("../utils/tokenService");
const {
  validateUsername,
  validatePassword,
} = require("../utils/RequestValidators");
const { createUser, findUserByUsername } = require("../model/userModel");
const { createWallet } = require("./walletController");

require("dotenv").config();

const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!validateUsername(username) || !validatePassword(password)) {
      return res
        .status(400)
        .json({ error: "Invalid username or weak password" });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await createUser(username, hashedPassword);

    const userPayload = { id: userId, username };
    const accessToken = generateAccessToken(userPayload);
    const r = await createWallet(userId);
    if (userId && r.created)
      res.status(201).json({ username, accessToken, r });
    else res.status(500).json({ error: "Failed to create user" });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const userPayload = { id: user.id, username };
    const accessToken = generateAccessToken(userPayload);

    res.json({ username, accessToken });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
