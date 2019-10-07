const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: String,
  source: {
    url: String,
    name: String,
  },
  image: String,
  ingredients: [String],
  popularityScore: Number,
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
