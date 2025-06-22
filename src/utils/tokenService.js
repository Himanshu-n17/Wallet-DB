const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '3d',
  });
};



module.exports = {
  generateAccessToken,
};
