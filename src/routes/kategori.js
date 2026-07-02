const express = require('express');
const router = express.Router();
const handlers = require('../handlers'); 

// Rute CRUD Kategori
router.get('/', handlers.daftarKategori);         // READ
router.post('/', handlers.tambahKategori);        // CREATE
router.put('/:id', handlers.editKategori);        // UPDATE
router.delete('/:id', handlers.hapusKategori);    // DELETE

module.exports = router;