const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../model/tourModel');
dotenv.config({ path: './config.env' });
const { dirname } = require('path');

const DB = process.env.DATABASE_FULL_URL;

// Config to connect db
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    //console.log(con.connections);
    console.log('DB connection successful !...');
  });

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// INPORT Data in DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Successfully Loaded..!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// DELETE all data from COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted..');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
