const express = require("express");
const router = express.Router();
const {
  getWalletBalance,
  fundWallet,
  transferMoney,
  getStatement,
} = require("../controller/walletController");
const verifyToken = require("../utils/verifyToken");

router.use(verifyToken);

router.get("/balance", getWalletBalance);
router.post("/fund", fundWallet);
router.post("/transfer", transferMoney);
router.get("/stmt", getStatement);

module.exports = router;
