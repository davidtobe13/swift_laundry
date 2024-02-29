const express = require('express');
const { createOrder } = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authentication');
const router = express.Router();

router.post('/create-order',authenticate, createOrder);

module.exports = router;
