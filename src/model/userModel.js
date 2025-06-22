const pool = require('../../db');

const createUser = async (username, hashedPassword) => {
  const [result] = await pool.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword]
  );
  return result.insertId;
};

const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  return rows[0];
};

module.exports = {
  createUser,
  findUserByUsername
};
