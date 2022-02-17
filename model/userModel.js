const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please Enter Your Name..!'],
  },
  email: {
    type: String,
    require: [true, 'Please Enter Your Email..!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email..!'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    min: 8,
    required: [true, 'Please Provide a Password..!'],
    select: false,
  },
  passwordConform: {
    type: String,
    required: [true, 'Please provide conform password'],
    validate: {
      // This only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not same..!',
    },
  },
  passwordChangedAt: Date,
});

//! Encrypting Password
userSchema.pre('save', async function (next) {
  // Only runs this function if password was modified
  if (!this.isModified('password')) return next();
  // Hash password
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConform = undefined;
  next();
});
//! Comparing Password for login
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check Chnaged Password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

//! Exportig Model1
module.exports = mongoose.model('User', userSchema);
