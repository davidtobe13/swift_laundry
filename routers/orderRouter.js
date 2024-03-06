const express = require('express');
const { deleteOrder, createOrder, getAllOrder } = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authentication');
const router = express.Router();

router.post('/create-order', authenticate, createOrder );
router.delete('/delete-order/:id',authenticate, deleteOrder)
router.get('/get-all-order', authenticate, getAllOrder)

module.exports = router;
