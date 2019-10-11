const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

const arrayNotEmpty = [(v) => v.length > 0, 'Path `{PATH}` must not be empty.'];

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  source: {
    url: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    domain: { type: String, required: true },
  },
  imageUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
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
