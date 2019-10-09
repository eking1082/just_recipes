const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: String,
  source: {
    url: String,
    name: String,
    domain: String,
  },
  image: String,
  ingredients: [String],
  directions: [String],
  // TODO: update time and servings to use numbers
  time: {
    prep: String,
    cook: String,
    active: String,
    inactive: String,
    ready: String,
    total: String,
  },
  servings: String,
  popularityScore: { type: Number, default: 0 },
  publishDate: Date,
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
