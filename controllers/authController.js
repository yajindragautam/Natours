const { promisify } = require('util');
const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');
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
    roles: user.roles,
    token,
  });
});
//! Protect Routes - ONly for logged user
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  // res.locals.user = currentUser;
  next();
});

// Aithorize User Role and Permission
exports.restricetTo = (...roles) => {
  return (req, res, next) => {
    // roles ["admin","lead-guide"]
    if (!roles.includes(req.user.roles)) {
      return next(
        new AppError(
          'You do not have permission to perform this action..!',
          403
        )
      );
    }

    next();
  };
};

//! Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot Your Password ? Submit a PATCH request with your new password and passwordConform to: ${resetURL}. /n
  If you did't forgot your password , Please ignore this email..!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Toekn -(Only valid for 10min)',
      message,
    });

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Token send to email.!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Something went wrong while sending email.! Try again later',
        500
      )
    );
  }
});
//! Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expire, and there is a user, change the password
  if (!user) {
    return next(new AppError('Token is invalid or expires.!', 400));
  }
  user.password = req.body.password;
  user.passwordConform = req.body.passwordConform;
  user.passwordResetToken = undefined; // Delete Reset Token
  user.passwordResetExpires = undefined; // Delete
  await user.save();
  // 3) Update changedPassword
  // 4) Login the user in, send JWT
  const token = signToken(user._id);
  res.status(201).json({
    status: 'Succes',
    token,
  });
});
