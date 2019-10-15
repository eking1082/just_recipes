const _ = require('lodash');
const { Recipe } = require('../models');

const OFFSET_DEFAULT = 0;
const LIMIT_DEFAULT = 20;
const MAX_LIMIT = 50;

const findPopular = (keyword, offset, limit) =>
  Recipe.find(keyword ? { name: { $regex: keyword, $options: 'i' } } : {})
    .sort({ popularityScore: 'desc', updatedAt: 'desc' })
    .skip(offset || OFFSET_DEFAULT)
    .limit(Math.min((limit || LIMIT_DEFAULT), MAX_LIMIT));

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  findPopular()
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

  findPopular(keyword, offset, limit)
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
  const { id } = req.query;

  Recipe.findById(id)
    .then((recipe) => {
      res.render('recipes/recipe', {
        title: recipe.name,
        recipe,
      });
    });
};
