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
    sourceName: 'The Pioneer Woman',
    name: $('.recipe-title').first().text(),
    servings: times.last().text(),
    publishDate: $('.entry-date.published').attr('datetime'),
  };
};
