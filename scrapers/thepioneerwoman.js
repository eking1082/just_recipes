const { removeQueryString } = require('../utils/url');

exports.baseUrl = 'https://thepioneerwoman.com/';
exports.sourceName = 'The Pioneer Woman';
exports.abbreviatedSourceName = 'tpw';
exports.pathWhitelist = ['cooking', 'food-and-friends'];

exports.scrapeRecipe = ($) => {
  const ingredients = $('.list-ingredients')
    .first()
    .children('li')
    .map((i, el) => $(el).text().replace(/\s\s+/g, ''))
    .get();

  const directions = $('.panel-body')
    .last()
    .contents()
    .map((i, el) => (el.type === 'text' ? $(el).text().trim() : null))
    .get();

  const times = $('.recipe-summary-time').find('dd');
  const time = {
    prep: times.first().text(),
    cook: $(times.get(2)).text(),
  };

  return {
    ingredients,
    directions,
    time,
    imageUrl: removeQueryString($("meta[property='og:image']").last().attr('content')),
    thumbnailUrl: $('.recipe-summary-thumbnail').find('img').first().attr('src'),
    name: $('.recipe-title').first().text(),
    servings: times.last().text(),
    publishDate: $('.entry-date.published').attr('datetime'),
  };
};
