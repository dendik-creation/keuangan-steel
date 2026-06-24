const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('index', { active: '' }));
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

// Protected pages (simple auth check)
function ensureAuth(req, res, next) {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  next();
}

router.get('/dashboard', ensureAuth, (req, res) => res.render('dashboard'));
router.get('/transaksi', ensureAuth, (req, res) => res.render('transaksi'));
router.get('/laporan', ensureAuth, (req, res) => res.render('laporan'));

module.exports = router;

