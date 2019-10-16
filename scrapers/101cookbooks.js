const moment = require('moment');
const { removeQueryString } = require('../utils/url');

exports.baseUrl = 'https://101cookbooks.com/';
exports.sourceName = '101 Cookbooks';
exports.abbreviatedSourceName = '101cb';

exports.scrapeRecipe = ($) => {
  const ingredients = [];
  const directions = [];
  const thumbnailUrl = $('.mainimagewide').children('img').data('lazy-src');
  $('.wprm-recipe-ingredient').each((i, el) => {
    ingredients.push($(el)
      .text()
      .replace(/\s\s+/g, ' ')
      .trim());
  });

  $('.wprm-recipe-instruction-group').each((i, el) => {
    $(el)
      .find('.wprm-recipe-instruction-text')
      .each((i, elChild) => {
        directions.push($(elChild).text());
      });
  });

  return {
    ingredients,
    directions,
    thumbnailUrl,
    time: {
      prep: $($('.wprm-recipe-time').get(1)).text(),
      total: $('.wprm-recipe-time').last().text(),
    },
    imageUrl: removeQueryString(thumbnailUrl),
    name: $('.wprm-recipe-container').children('h2').text(),
    servings: $('.wprm-recipe-time').first().text().trim(),
    publishDate: moment($('.recipedate').find('a').first().text(), 'MMMM DD, YYYY'),
  };
};
