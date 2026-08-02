/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId, bookingConfig = {}) => {
  try {
    if (!window.Razorpay) {
      throw new Error('Payment checkout failed to load. Please try again.');
    }

    if (!bookingConfig.razorpayKey) {
      throw new Error('Payment configuration is missing. Please try again.');
    }

    const response = await axios(`/api/v1/bookings/checkout-order/${tourId}`);

    const { order } = response.data;

    // 2) Configure Razorpay checkout
    const options = {
      key: bookingConfig.razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'Natours',
      description: 'Tour Booking',
      order_id: order.id,

      handler: async function (paymentResponse) {
        try {
          // 3) Verify payment on backend
          const verification = await axios.post(
            '/api/v1/bookings/verify-payment',
            paymentResponse,
          );

          if (verification.data.status === 'success') {
            showAlert('success', 'Payment successful! Booking confirmed.');

            window.setTimeout(() => {
              location.assign('/my-bookings');
            }, 1500);
          }
        } catch (err) {
          showAlert('error', err.response.data.message);
        }
      },

      prefill: {
        name: bookingConfig.userName,
        email: bookingConfig.userEmail,
      },

      theme: {
        color: '#55c57a',
      },
    };

    // 4) Open Razorpay Checkout popup
    const razorpay = new window.Razorpay(options);

    razorpay.open();
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
};
