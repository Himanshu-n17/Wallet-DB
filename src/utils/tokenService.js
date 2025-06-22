const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generate an access token (short-lived)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '3d',
  });
};

/**
 * Generate a refresh token (longer-lived)
 */
// const generateRefreshToken = (payload) => {
//   return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
//   });
// };

// /**
//  * Verify refresh token
//  */
// const verifyRefreshToken = (token) => {
//   return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
// };

module.exports = {
  generateAccessToken,
  // generateRefreshToken,
  // verifyRefreshToken,
};
