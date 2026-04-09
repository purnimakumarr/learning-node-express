const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({
  mergeParams: true,
});

router.use(protect);

router.route('/').get(getAllReviews);
router.route('/:id').get(getReview);
router.route('/').post(restrictTo('user'), setTourUserIds, createReview);
router.route('/:id').patch(restrictTo('user', 'admin'), updateReview);
router.route('/:id').delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
