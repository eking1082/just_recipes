const rp = require('request-promise');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const Page = require('../models/Page');

// TODO: move this config and use in app.js
mongoose.Promise = bluebird;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect('mongodb://localhost:27017/just_recipes');
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

exports.savePage = (url) => rp(url).then((html) => {
  const page = new Page({ url, html });
  console.log(page.url);
  return page.save();
});
