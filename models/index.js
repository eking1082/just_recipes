require('dotenv/config');
const mongoose = require('mongoose');
const bluebird = require('bluebird');

const Page = require('./Page');
const User = require('./User');
const Recipe = require('./Recipe');

mongoose.Promise = bluebird;
mongoose.connect(process.env.MONGODB_URI, {
  useFindAndModify: false,
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

module.exports = { Page, Recipe, User };
