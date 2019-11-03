const _ = require('lodash');
const { Recipe } = require('../models');

const getPagingParams = (page) => {
  page = page || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  return { limit, offset };
};

const find = (page) => {
  const { offset, limit } = getPagingParams(page);

  return Recipe.find()
    .sort({ updatedAt: 'desc' })
    .skip(offset)
    .limit(limit);
};

const findByKeyword = (page, keyword) => {
  const { offset, limit } = getPagingParams(page);

  return Recipe.find({ $text: { $search: keyword } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(offset)
    .limit(limit);
};

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  const {
    p: page,
    q: keyword,
  } = req.query;

  const query = keyword ? findByKeyword(page, keyword) : find(page);
  query.then((recipes) => {
    const renderOptions = {
      recipes,
      lastPage: recipes.length < 20,
    };

    if (keyword) {
      renderOptions.title = _.startCase(keyword);
      renderOptions.keyword = keyword;
    }

    res.render('recipes', renderOptions);
  });
};
