const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');

// USERS

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Get all users
  const users = await User.find();
  // Send response
  return res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUsers = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
