const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getCheckoutOrder = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const order = await razorpay.orders.create({
    amount: tour.price * 100,
    currency: 'INR',
    receipt: `tour_${tour.id}`,
    notes: {
      tourId: tour.id,
      userId: req.user.id,
    },
  });

  res.status(200).json({
    success: true,
    order,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({
      status: 'fail',
      message: 'Payment verification failed',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment verified',
  });
});

const createBookingCheckout = async (payment) => {
  const orderId = payment.order_id;

  const order = await razorpay.orders.fetch(orderId);

  const tour = order.notes.tourId;
  const user = order.notes.userId;
  const price = order.amount / 100;

  await Booking.create({
    tour,
    user,
    price,
  });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid webhook');
  }

  if (req.body.event === 'payment.captured') {
    createBookingCheckout(req.body.payload.payment.entity);
  }

  res.status(200).json({
    received: true,
  });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
