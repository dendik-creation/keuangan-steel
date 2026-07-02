// src/routes/transaksi.js
const express = require('express');
const router = express.Router();
// Import handlers (pastikan path-nya benar, mundur 1 folder ke src)
const handlers = require('../handlers'); 

// Definisikan rute CRUD
router.get('/', handlers.daftarTransaksi);          // READ
router.post('/', handlers.tambahTransaksi);         // CREATE
router.put('/:id', handlers.editTransaksi);         // UPDATE
router.delete('/:id', handlers.hapusTransaksi);     // DELETE

module.exports = router;