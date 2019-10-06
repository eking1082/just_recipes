const _ = require('lodash');
const Recipe = require('../models/Recipe');

const OFFSET_DEFAULT = 0;
const LIMIT_DEFAULT = 20;
const MAX_LIMIT = 50;

const findPopular = (query, offset, limit) =>
  Recipe.find(query ? { name: { $regex: query, $options: 'i' } } : {})
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
    q: query,
    o: offset,
    l: limit,
  } = req.query;

  findPopular(query, offset, limit)
    .then((recipes) => {
      res.render('recipes', {
        title: _.startCase(query),
        query,
        recipes,
      });
    });
};
