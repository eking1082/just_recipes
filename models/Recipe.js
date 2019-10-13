const mongoose = require('mongoose');
const { isValidUrl } = require('../utils/url');

const arrayNotEmpty = [(v) => v.length > 0, 'Path `{PATH}` must not be empty.'];

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
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
    name: { type: String, required: true },
    domain: { type: String, required: true },
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
  ingredients: {
    type: [String],
    required: true,
    validate: arrayNotEmpty,
  },
  directions: {
    type: [String],
    required: true,
    validate: arrayNotEmpty,
  },
  time: {
    prep: String,
    cook: String,
    active: String,
    inactive: String,
    ready: String,
    total: String,
  },
  servings: Number,
  popularityScore: { type: Number, default: 0 },
  publishDate: Date,
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
