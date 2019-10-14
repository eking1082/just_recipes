exports.baseUrl = 'https://grannysvitalvittles.com/';
exports.sourceName = 'Granny\'s Vital Vittles';

exports.scrapeRecipe = ($) => {
  const ingredients = $('.ingredients-list')
    .children('li')
    .map((i, el) => $(el).text().replace(/\s\s+/g, '').trim())
    .get();

  const directions = $('.directions-list')
    .children('li')
    .map((i, el) => $(el).text().replace(/\s\s+/g, '').trim())
    .get();

  let servings;
  const time = {};
  $('.detail-item').each((i, el) => {
    const label = $(el).find('.detail-item-label').text();
    const value = $(el).find('.detail-item-value').text();

    if (label === 'Yield') {
      servings = value;
    } else if (label === 'Cooking Time') {
      time.cook = value;
    } else if (label === 'Prep Time') {
      time.prep = value;
    }
  });

  return {
    servings,
    ingredients,
    directions,
    time,
    imageUrl: $('.wp-block-image').find('img').attr('src'),
    thumbnailUrl: $('.wp-block-image').find('img').attr('src'),
    name: $('.details-title').text(),
  };
};
