const pool = require("../../db");
const {
  validateUsername,
  validateAmount,
} = require("../utils/RequestValidators");

const axios = require('axios');

const getWalletBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const targetCurrency = req.query.currency?.toUpperCase() || 'INR';

    const [rows] = await pool.query(
      'SELECT balance FROM wallets WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    let balance = parseFloat(rows[0].balance);
    let convertedBalance = balance;
    let currencyUsed = 'INR';

    if (targetCurrency !== 'INR') {
      const apiKey = process.env.CURRENCY_API_KEY;
      const url = `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=${targetCurrency}&base_currency=INR`;

      try {
        const { data } = await axios.get(url);

        const rate = data.data?.[targetCurrency]?.value;
        if (!rate) {
          return res.status(400).json({ error: 'Invalid currency code' });
        }

        convertedBalance = balance * rate;
        currencyUsed = targetCurrency;
      } catch (err) {
        return res.status(500).json({ error: 'Currency conversion failed' });
      }
    }

    res.json({
      balance: +convertedBalance.toFixed(2),
      currency: currencyUsed,
    });
  } catch (err) {
    next(err);
  }
};


const createWallet = async (user) => {
  try {
    const userId = user;

    const [existing] = await pool.query(
      "SELECT id FROM wallets WHERE user_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Wallet already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO wallets (user_id, balance) VALUES (?, ?)",
      [userId, 0.0]
    );

    return { created: true, walletId: result.insertId, balance: 0.0 };
  } catch (err) {
    throw err;
  }
};

const fundWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    const [walletRows] = await pool.query(
      "SELECT balance FROM wallets WHERE user_id = ?",
      [userId]
    );

    if (walletRows.length === 0) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const newBalance = parseFloat(walletRows[0].balance) + parseFloat(amount);

    await pool.query("UPDATE wallets SET balance = ? WHERE user_id = ?", [
      newBalance,
      userId,
    ]);

    await pool.query(
      "INSERT INTO transactions (sender_id, receiver_id, amount, type, receiver_balance_after) VALUES (?, ?, ?, ?, ?)",
      [userId, userId, amount, "credit", newBalance]
    );

    res.json({ message: "Wallet funded successfully", balance: newBalance });
  } catch (err) {
    next(err);
  }
};



const transferMoney = async (req, res, next) => {
  const senderId = req.user.id;
  const senderUsername = req.user.username;
  const { toUsername, amount } = req.body;

  if (!validateUsername(toUsername)) {
    return res.status(400).json({ error: "Invalid recipient username" });
  }

  if (!validateAmount(amount)) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  if (toUsername === senderUsername) {
    return res.status(400).json({ error: "Cannot transfer to yourself" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [senderWalletRows] = await conn.query(
      "SELECT id, balance FROM wallets WHERE user_id = ?",
      [senderId]
    );
    if (senderWalletRows.length === 0) {
      throw new Error("Sender wallet not found");
    }
    const senderBalance = parseFloat(senderWalletRows[0].balance);
    if (senderBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const [receiverUserRows] = await conn.query(
      "SELECT id FROM users WHERE username = ?",
      [toUsername]
    );
    if (receiverUserRows.length === 0) {
      return res.status(404).json({ error: "Recipient user not found" });
    }
    const receiverId = receiverUserRows[0].id;

    const [receiverWalletRows] = await conn.query(
      "SELECT id, balance FROM wallets WHERE user_id = ?",
      [receiverId]
    );
    if (receiverWalletRows.length === 0) {
      return res.status(404).json({ error: "Recipient wallet not found" });
    }

    const newSenderBalance = senderBalance - amount;
    const newReceiverBalance =
      parseFloat(receiverWalletRows[0].balance) + amount;

    await conn.query("UPDATE wallets SET balance = ? WHERE user_id = ?", [
      newSenderBalance,
      senderId,
    ]);
    await conn.query("UPDATE wallets SET balance = ? WHERE user_id = ?", [
      newReceiverBalance,
      receiverId,
    ]);

    await conn.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type, sender_balance_after) VALUES (?, ?, ?, ?, ?)',
      [senderId, receiverId, amount, 'debit', newSenderBalance]
    );

    await conn.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type, receiver_balance_after) VALUES (?, ?, ?, ?, ?)',
      [senderId, receiverId, amount, 'credit', newReceiverBalance]
    );

    await conn.commit();
    res.json({ message: "Transfer successful", balance: newSenderBalance });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};


const getStatement = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT 
        t.type AS kind,
        t.amount AS amt,
        t.created_at AS timestamp,
        CASE 
          WHEN t.type = 'debit' AND t.sender_id = ? THEN t.sender_balance_after
          WHEN t.type = 'credit' AND t.receiver_id = ? THEN t.receiver_balance_after
          ELSE NULL
        END AS updated_bal
      FROM transactions t
      WHERE 
        (t.sender_id = ? AND t.type = 'debit')
        OR (t.receiver_id = ? AND t.type = 'credit')
      ORDER BY t.created_at DESC
      `,
      [userId, userId, userId, userId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};





module.exports = {
  getWalletBalance,
  createWallet,
  fundWallet,
  transferMoney,
  getStatement
};
