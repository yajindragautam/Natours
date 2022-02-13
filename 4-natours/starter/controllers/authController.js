const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');

//! Create New User
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'Succes',
    data: {
      user: newUser,
    },
  });
});
