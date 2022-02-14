const mongoose = require('mongoose');
const router = require('../routes/tourRouters');
const AppError = require('../utils/appError');
// Importing tourModel ==>
const Tour = require('./../model/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
//! Cating Error In Asynce Functions
const catchAsync = require('./../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// Handlers
//Read file data from tours-simple.json file
//Router of tours -GET REQUEST - Read data

// Refracting Our Routes
//Router of tours -GET REQUEST - Read data
exports.getTours = catchAsync(async (req, res, next) => {
  // use TRY - CATCH to fetch erros
  // BUILD QUERY
  //EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const tours = await features.query;
  /* 1st way of filtering
    const tours = await Tour.find({
      duration: 5,
      difficulty: 'easy',
    });

    2nd way of filtering
    const tours = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');
    */

  // const tours = await Tour.find();
  // res.json(tours);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// Read data from ID: Response to URL parameters: 127.0.0.1/tours/5 - GET METHOD
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

//Router of tours - POST REQUEST - Create new tours
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

// Handeling PATCH request
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

// Handeling DELETE request
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    satus: 'Success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 3.4 } },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  //console.log(stats);
  // Response
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// Get Monthly Pan
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({
    satus: 'Success',
    data: {
      plan,
    },
  });
});
