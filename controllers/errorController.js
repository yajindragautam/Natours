const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
// (["'])(\\?.)*?\1
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  console.log('Value Here👉:', err.keyValue.code);
  const message = `Duplicate field: x. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid inputs data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token.Please logged in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired.!Please log in again.', 401);

const sendErrorDev = (err, res) => {
  // Operational. trusted error: Send message to client
  res.status(err.statusCode).json({
    stauts: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      stauts: err.status,
      message: err.message,
    });
    // Programming or other unknown error: do't leak error details
  } else {
    // 1) Log Error
    console.log('ERROR 🔥:', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong..!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    // Handling Cast Error
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // Handling Duplicate Fields
    if (error.code === 1100) error = handleDuplicateFieldsDB(error);
    // Handling ValidationError
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // Handling JWT invalid token
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // Handling JWT Expire TokenExpiredError
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
