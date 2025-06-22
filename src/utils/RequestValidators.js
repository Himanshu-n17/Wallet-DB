// src/utils/validator.js
const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return usernameRegex.test(username);
};

const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateAmount = (amount) => {
  return typeof amount === 'number' && amount > 0;
};

module.exports = {
  validateUsername,
  validatePassword,
  validateAmount,
};
