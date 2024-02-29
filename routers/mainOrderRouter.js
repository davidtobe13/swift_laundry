const express = require('express');
const { createUserOrder } = require('../controllers/mainOrderController');
const { authenticate } = require('../middlewares/authentication');
const router = express.Router();

router.post('/create-user-order', authenticate, createUserOrder);

module.exports = router;
