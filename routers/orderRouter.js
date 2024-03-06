const express = require('express');
const { deleteOrder, createOrder } = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authentication');
const router = express.Router();

router.post('/create-order', authenticate, createOrder );
router.delete('/delete-order/:id',authenticate, deleteOrder)

module.exports = router;
