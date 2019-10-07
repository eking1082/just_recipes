const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  url: String,
  html: String,
  scraped: { type: Boolean, default: false },
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;
