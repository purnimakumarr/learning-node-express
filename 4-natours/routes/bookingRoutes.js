const express = require('express');
const { getCheckoutOrder } = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.get('/checkout-order/:tourId', protect, getCheckoutOrder);

module.exports = router;
