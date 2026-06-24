const express = require('express');
const router = express.Router();
const db = require('../db');


// Ringkasan keuangan
router.get('/summary', async (req, res) => {
  try {
    const userId = req.session.userId;

    const [rows] = await db.query(`
      SELECT 
        SUM(CASE WHEN jenis = 'Pemasukan' THEN jumlah ELSE 0 END) AS totalIncome,
        SUM(CASE WHEN jenis = 'Pengeluaran' THEN jumlah ELSE 0 END) AS totalExpense
      FROM transaksi
      WHERE user_id = ?
    `, [userId]);

    const totalIncome = rows[0].totalIncome || 0;
    const totalExpense = rows[0].totalExpense || 0;

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Gagal mengambil summary'
    });
  }
});


// Data grafik
router.get('/chart', async (req, res) => {
  try {
    const userId = req.session.userId;

    const [rows] = await db.query(`
      SELECT 
        MONTH(tanggal) AS bulan,
        SUM(CASE WHEN jenis='Pemasukan' THEN jumlah ELSE 0 END) AS income,
        SUM(CASE WHEN jenis='Pengeluaran' THEN jumlah ELSE 0 END) AS expense
      FROM transaksi
      WHERE user_id = ?
      GROUP BY MONTH(tanggal)
      ORDER BY bulan
    `, [userId]);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Gagal mengambil chart'
    });
  }
});


module.exports = router;