const express = require('express');
const { get } = require('https');
const morgan = require('morgan');
//Importing Routes
const AppError = require('./utils/appError');
const globleErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRouters');
const tourRouter = require('./routes/tourRouters');

const app = express();
// 1) Middelware
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// Custom Middleware
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Refracting Route URL
// ROUTES

app.use('/api/v1/tours', tourRouter); //  Router for Tours
app.use('/api/v1/users', userRouter);
// Hnadle Unhandle Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cn't find ${req.originalUrl} on the server`, 404));
});
// Golble Error Handeling Middleware
app.use(globleErrorHandler);

// Server
module.exports = app;
