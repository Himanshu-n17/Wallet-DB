const express = require('express');
const router = express.Router();

const walletRoutes = require('./walletRoutes');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');

router.use('/wallet', walletRoutes);
router.use('/auth', authRoutes);
router.use('/product', productRoutes);

module.exports = router;
