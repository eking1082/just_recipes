const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  url: { type: String, unique: true, required: true },
  domain: { type: String, required: true },
  uuid: String,
  scraped: { type: Boolean, default: false },
  ignore: { type: Boolean, default: false },
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;
