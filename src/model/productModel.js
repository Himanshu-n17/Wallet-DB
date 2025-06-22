const pool = require('../../db');

const insertProduct = async (name, price, description) => {
  const [result] = await pool.query(
    'INSERT INTO products (name, price, description) VALUES (?, ?, ?)',
    [name, price, description]
  );
  return result.insertId;
};

const getAllProducts = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, price, description FROM products ORDER BY created_at DESC'
  );
  return rows;
};

module.exports = {
  insertProduct,
  getAllProducts
};

