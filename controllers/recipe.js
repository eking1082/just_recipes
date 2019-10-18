const _ = require('lodash');
const { Recipe } = require('../models');

const findPopular = (page, keyword) => {
  page = page || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  return Recipe.find(keyword ? { name: { $regex: keyword, $options: 'i' } } : {})
    .sort({ popularityScore: 'desc', updatedAt: 'desc' })
    .skip(offset)
    .limit(limit);
};

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  const { page } = req.params;

  findPopular(page)
    .then((recipes) => {
      res.render('recipes', { recipes });
    });
};

/**
 * GET /search
 * Recipe search
 */
exports.search = (req, res) => {
  const {
    q: keyword,
    o: offset,
    l: limit,
  } = req.query;

  findPopular(offset, limit, keyword)
    .then((recipes) => {
      res.render('recipes', {
        title: _.startCase(keyword),
        keyword,
        recipes,
      });
    });
};

/**
 * GET /recipe
 * Recipe
 */
exports.recipe = (req, res) => {
  const { path } = req.params;

  Recipe.findOne({ path })
    .then((recipe) => {
      res.render('recipes/recipe', {
        title: recipe.name,
        recipe,
      });
    });
};
