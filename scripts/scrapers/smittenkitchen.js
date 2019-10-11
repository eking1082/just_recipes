const rp = require('request-promise');
const moment = require('moment');
const cheerio = require('cheerio');
const removeQueryString = require('../../utils/removeQueryString');

const BASE_INDEX = 'https://thepioneerwoman.com/cooking/';

const getLatestPost = ($) => {
  const latestPost = $('.latest-post__post-container');
  const dateString = latestPost.find('.latest-post__byline')
    .contents()
    .last()
    .text()
    .trim();

  return {
    date: moment(dateString, 'on MMMM DD, YYYY'),
    url: latestPost.find('a').first().attr('href'),
  };
};

const parsePost = (post) => ({
  date: moment(post.find('.dateline').text(), 'MMMM DD, YYYY'),
  url: post.find('a').attr('href'),
});

// maybe use https://smittenkitchen.com/YYYY/?infinity=scrolling
exports.scrapeRecipeIndex = (pageUrl = BASE_INDEX) => rp({
  uri: pageUrl,
  transform(body) {
    return cheerio.load(body);
  },
}).then(($) => {
  const posts = $('.container.category-with-latest-filter-results')
    .find('.post-card-vertical.category-cooking')
    .map((i, post) => parsePost($(post)))
    .get();

  if (pageUrl === BASE_INDEX) posts.unshift(getLatestPost($));

  return {
    recipes: posts.filter((post) => !post.url.includes('video')),
    nextPageUrl: $('.next').attr('href'),
  };
});

const oldSmitten = ($) => {
  const body = $('.entry-content').children('p');
  let ingredientSwitch = false;
  const orderedListRegex = new RegExp(/\d\.\s/);
  const servingWords = ['Yield', 'Serve', 'Servings'];
  const servingsRegex = new RegExp(servingWords.join('|'), 'i');

  const recipe = {
    ingredients: [],
    directions: [],
    publishDate: $('.entry-date.published').attr('datetime'),
  };

  body.each((i, el) => {
    if (i === 0) {
      recipe.name = $(el).children('b').text().trim();
    } else if (
      $(el).children('br').length
      && !$(el).children('b').length
      && !orderedListRegex.test($(el).text())
      && !servingsRegex.test($(el).text())
    ) {
      ingredientSwitch = true;
      recipe.ingredients.push(...$(el).text().trim().split('\n'));
    } else if (ingredientSwitch) {
      recipe.directions.push(...$(el).text().trim().split('\n'));
    } else {
      const possibleServing = $(el).text();
      if (servingsRegex.test(possibleServing)) {
        possibleServing.split('\n').forEach((line) => {
          if (servingsRegex.test(line)) {
            recipe.servings = line.substring(line.indexOf(':') + 2);
          }
        });
      }
    }
  });

  return recipe;
};

const newSmitten = ($) => {
  const recipe = {
    ingredients: [],
    directions: [],
    time: {},
  };
  recipe.name = $('.jetpack-recipe-title').text();

  $('.jetpack-recipe-ingredients')
    .children('ul')
    .first()
    .children()
    .each((i, el) => {
      recipe.ingredients.push($(el).text());
    });

  recipe.directions = $('.jetpack-recipe-directions')
    .text()
    .split('\n')
    .filter((direction) => direction);

  if (!recipe.directions.length) {
    const lastIngredient = recipe.ingredients[recipe.ingredients.length - 1];
    const recipeContents = $('.entry-content').text();
    recipe.directions = recipeContents
      .slice(recipeContents.indexOf(lastIngredient) + lastIngredient.length,
        recipeContents.indexOf('Rate this:'))
      .split('\n')
      .filter((instruction) => instruction);
  }

  recipe.time.total = $('time[itemprop=totalTime]').text().replace('Time: ', '');

  recipe.servings = $('.jetpack-recipe-servings').text().replace('Servings: ', '');

  return recipe;
};

exports.scrapeRecipe = ($) => {
  const recipe = $('.jetpack-recipe').length ? newSmitten($) : oldSmitten($);

  const imageUrl = $('.wp-post-image').attr('src');
  return {
    ...recipe,
    sourceName: 'Smitten Kitchen',
    imageUrl: removeQueryString(imageUrl),
    thumbnailUrl: imageUrl,
    publishDate: $('.entry-date.published').attr('datetime'),
  };
};
