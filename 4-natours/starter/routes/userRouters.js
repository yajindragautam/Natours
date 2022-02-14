const express = require('express');
// Importing Handlers- Controller
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();
// ROUTES - users
//! Signup New User
router.post('/signup', authController.signup);
//! Login
router.post('/login', authController.login);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Exporting
module.exports = router;
