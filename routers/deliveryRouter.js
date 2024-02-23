const express = require('express');
const { acceptDelivery, rescheduleDelivery } = require('../controllers/deliveryController');
const authenticate = require('../middlewares/authentication');
const router = express.Router();

router.post('/accept-delivery/:deliveryId', authenticate, acceptDelivery);

router.post('/reschedule-delivery/:deliveryId', rescheduleDelivery);


module.exports = router;
