const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const { Schema } = mongoose;

// Creating Schema -> Tours
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 character'],
      minlength: [10, 'A tour name must have 10 characters'],
      //validate:[validator.isAlpha,'Tour name must be string ']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty Must Be Easy, Medium or Difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      mix: [5, 'Rating Must Be 5.0'],
      min: [1, 'Rating Must Be abouve 1.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount Price Should Be Below Regular Price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have image coever'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtual: true },
  }
);
// DOCUMENT MIDDLEWARE : runs only before .save() and .create()
// pre = all action befor saving data
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
/*
// You can make multiple pre and post Middlewares
tourSchema.pre('save', function (next) {
  console.log('Will save document..');
  next();
});
// post = all action perform after saved
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
}); */

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// post
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milisecond.`);
  console.log(docs);
  next();
});
// Aggrigation Middleware
tourSchema.pre('aggregate', function () {
  this.pipeline().unsift({ $match: { $ne: true } });
  console.log(this.pipeline());
  next();
});
// Creating Virtual Property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Creating Model for Tour Schema
const Tour = mongoose.model('Tour', tourSchema);

// Exporting tourModel ===> tourController
module.exports = Tour;
