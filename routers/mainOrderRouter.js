const express = require('express');
const { createUserOrder, getAddedOrder, getAllMainOrders, getCartItems } = require('../controllers/mainOrderController');
const { authenticate } = require('../middlewares/authentication');
const { addToCart } = require('../controllers/cartController');
const router = express.Router();

router.post('/create-user-order/:shopId', authenticate, createUserOrder);
router.get("/get-added-order", authenticate, getAddedOrder);
router.get('/get-all-main-order', authenticate, getAllMainOrders)
router.post('/add-to-cart', authenticate, addToCart)
router.get('/get-cart-items', authenticate, getCartItems)

module.exports = router;
