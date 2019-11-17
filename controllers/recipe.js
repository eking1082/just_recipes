const _ = require('lodash');
const { Recipe } = require('../models');
const { getOffsetAndLimit } = require('../utils/paging');

const find = (page) => {
  const { offset, limit } = getOffsetAndLimit(page);

  return Recipe.find()
    .sort({ updatedAt: 'desc' })
    .skip(offset)
    .limit(limit);
};

const findByKeyword = (page, keyword) => {
  const { offset, limit } = getOffsetAndLimit(page);

  return Recipe.find({ $text: { $search: keyword } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(offset)
    .limit(limit);
};

const findFavorites = (user, page) => {
  const { offset, limit } = getOffsetAndLimit(page);

  return Recipe.find({
    _id: {
      $in: user.favorites.map(({ recipeId }) => recipeId),
    },
  }).sort({ updatedAt: 'desc' })
    .skip(offset)
    .limit(limit);
};

/**
 * GET /
 * Recipes index, supports search and paging
 */
exports.index = (req, res) => {
  const { user } = req;
  const {
    p: page,
    q: keyword,
  } = req.query;

  const query = keyword ? findByKeyword(page, keyword) : find(page);
  query.then((recipes) => {
    if (user) {
      recipes = recipes.map((recipe) => {
        recipe.favorited = user.favorites.some((favorite) => favorite.recipeId === recipe.id);
        return recipe;
      });
    }

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

/**
 * GET /favorites
 * User favorite recipes
 */
exports.getFavorites = (req, res) => {
  const { user } = req;
  const { p: page } = req.query;

  findFavorites(user, page).then((recipes) => {
    res.render('recipes/favorites', {
      recipes,
      title: 'My Favorites',
      lastPage: recipes.length < 20,
    });
  });
};
