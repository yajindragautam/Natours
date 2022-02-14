const express = require('express');
// Importing Handlers- Controllers
const tourController = require('./../controllers/tourController'); // tourController contains all handlers
const authController = require('./../controllers/authController');
const router = express.Router(); // Middleware for Tours Routes

//router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get( tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

// Exporting Routes
module.exports = router;
