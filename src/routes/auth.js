const express = require('express');
const router = express.Router();
const { register, login, logout, getCurrentUser } = require('../handlers');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user', getCurrentUser);

module.exports = router;