const express = require("express");
const router = express.Router();
const { addProduct, listProducts, buyProduct } = require("../controller/productController");
const verifyToken = require("../utils/verifyToken");

router.get("/", listProducts);

router.post("/", verifyToken, addProduct);
router.post("/buy", verifyToken, buyProduct);

module.exports = router;
