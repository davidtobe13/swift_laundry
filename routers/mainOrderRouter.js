const express = require('express');
const { createUserOrder, getAddedOrder, getAllMainOrders } = require('../controllers/mainOrderController');
const { authenticate } = require('../middlewares/authentication');
const router = express.Router();

router.post('/create-user-order', authenticate, createUserOrder);
router.get("/get-added-order", authenticate, getAddedOrder);
router.get('/get-all-main-order', authenticate, getAllMainOrders)

module.exports = router;
