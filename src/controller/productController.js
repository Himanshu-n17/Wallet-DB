const pool = require("../../db");
const { insertProduct, getAllProducts } = require("../model/productModel");

const addProduct = async (req, res, next) => {
  try {
    const { name, price, description } = req.body;

    if (!name || typeof name !== "string" || name.length < 3) {
      return res.status(400).json({ error: "Invalid product name" });
    }

    if (!price || typeof price !== "number" || price <= 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const id = await insertProduct(name, price, description || "");
    res.status(201).json({ id, message: "Product added" });
  } catch (err) {
    next(err);
  }
};

const listProducts = async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

const buyProduct = async (req, res, next) => {
  const userId = req.user.id;
  const { product_id } = req.body;

  if (!product_id || typeof product_id !== "number") {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [productRows] = await conn.query(
      "SELECT price FROM products WHERE id = ?",
      [product_id]
    );
    if (productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const price = parseFloat(productRows[0].price);

    const [walletRows] = await conn.query(
      "SELECT balance FROM wallets WHERE user_id = ?",
      [userId]
    );
    if (walletRows.length === 0) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const balance = parseFloat(walletRows[0].balance);
    if (balance < price) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const newBalance = balance - price;

    await conn.query("UPDATE wallets SET balance = ? WHERE user_id = ?", [
      newBalance,
      userId,
    ]);

    await conn.query(
      "INSERT INTO transactions (sender_id, receiver_id, amount, type) VALUES (?, ?, ?, ?)",
      [userId, null, price, "debit"]
    );

    await conn.query(
      "INSERT INTO purchases (user_id, product_id) VALUES (?, ?)",
      [userId, product_id]
    );

    await conn.commit();
    res.json({ message: "Product purchased", balance: newBalance });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

module.exports = {
  addProduct,
  listProducts,
  buyProduct,
};
