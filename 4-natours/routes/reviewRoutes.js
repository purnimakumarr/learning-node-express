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

router.route('/').get(getAllReviews);
router.route('/:id').get(getReview);
router
  .route('/')
  .post(protect, restrictTo('user'), setTourUserIds, createReview);
router.route('/:id').patch(updateReview);
router.route('/:id').delete(deleteReview);

module.exports = router;
