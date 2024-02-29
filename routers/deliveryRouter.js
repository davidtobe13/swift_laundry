const express = require('express');
const { acceptDelivery, rescheduleDelivery } = require('../controllers/deliveryController');
const {authenticate} = require('../middlewares/authentication');
const router = express.Router();

router.post('/accept-delivery/:orderId', authenticate, acceptDelivery);

router.post('/reschedule-delivery/:orderId', authenticate, rescheduleDelivery);


module.exports = router;
