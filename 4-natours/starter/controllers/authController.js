const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
// Fn To Create JSON Wen Toke
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};
//! Create New User
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  // Creating New JSON Wen Token
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'Succes',
    token,
    data: {
      user: newUser,
    },
  });
});

//! Login Users
exports.login = catchAsync(async (req, res, next) => {
  // Taking email and password from user
  const { email, password } = req.body;
  // 1) Check If email and password exit
  if (!email || !password) {
    return next(new AppError('Please provide email and password'));
  }
  // 2) Check if user exits && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 401));
  }
  // 3) If everything ok, send JSON web token to clinet
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
//! Protect Routes - ONly for logged user
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of ti's there
  // 2) Verification token
  // 3) Check if user still exits
  // 4) Check if user changed password after the token issued
  next();
});
