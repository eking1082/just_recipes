const mongoose = require('mongoose');
const { isValidUrl } = require('../utils/url');

const arrayNotEmpty = [(v) => v.length > 0, 'Path `{PATH}` must not be empty.'];

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  source: {
    url: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: isValidUrl,
        message: '{VALUE} is not a valid URL',
      },
    },
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator: isValidUrl,
      message: '{VALUE} is not a valid URL',
    },
  },
  thumbnailUrl: {
    type: String,
    required: true,
    validate: {
      validator: isValidUrl,
      message: '{VALUE} is not a valid URL',
    },
  },
  ingredients: [{
    type: String,
    required: true,
    trim: true,
    validate: arrayNotEmpty,
  }],
  directions: [{
    type: String,
    required: true,
    trim: true,
    validate: arrayNotEmpty,
  }],
  time: {
    prep: { type: String, trim: true },
    cook: { type: String, trim: true },
    active: { type: String, trim: true },
    inactive: { type: String, trim: true },
    ready: { type: String, trim: true },
    total: { type: String, trim: true },
  },
  servings: Number,
  popularityScore: { type: Number, default: 0 },
  publishDate: Date,
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
