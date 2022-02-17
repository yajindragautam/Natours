const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// Handling uncaughtException Rejection
process.on('uncaughtException', (err) => {
  console.log('UNHANDLED REJECTION 🔥 Shutting Down Server..!');
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
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

//console.log(process.env);

// Creating Document to store inito db
/*const testTour = new Tour({
  name: 'The Park Camper',
  rating: 4.7,
  price: 497,
});*/

//testTour.save()  ==> to store data inti db

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`App Running on port http://127.0.0.1:${port}..`);
});
// Handling Un-handle Rejection
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 🔥 Shutting Down Server..!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
