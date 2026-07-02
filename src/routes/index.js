const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const transaksiRoutes = require('./transaksi');
const kategoriRoutes = require('./kategori');
const dashboardRoutes = require('./dashboard');

router.use('/auth', authRoutes);
router.use('/transaksi', transaksiRoutes);
router.use('/kategori', kategoriRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;