const express = require('express');
// Importing Handlers- Controller
const userController = require('./../controllers/userController');

const router = express.Router();
// ROUTES - users
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
