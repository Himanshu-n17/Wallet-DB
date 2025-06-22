const express = require("express");
const router = express.Router();
const {
  getWalletBalance,
  fundWallet,
  transferMoney,
  getStatement,
} = require("../controller/walletController");
const verifyToken = require("../utils/verifyToken");

router.use(verifyToken); // 🔐 all routes below require token

router.get("/balance", getWalletBalance);
router.post("/fund", fundWallet);
router.post("/transfer", transferMoney);
router.get("/stmt", getStatement);

module.exports = router;
