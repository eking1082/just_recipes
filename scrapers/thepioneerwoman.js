const rp = require('request-promise');
const cheerio = require('cheerio');

// returns a list of recipe urls from thepioneerwoman.com/cooking/ added after fromDate
exports.crawlNewRecipes = (fromDate) => rp({
  uri: 'https://thepioneerwoman.com/cooking/',
  transform(body) {
    return cheerio.load(body);
  },
}).then(($) => {
  const urls = $('.container.category-with-latest-filter-results')
    .find('.post-card-vertical.category-cooking')
    .find('a')
    .map((i, el) => $(el).attr('href'))
    .get();
  return urls;
});

exports.scrapeRecipe = (url) => {
  if (!url.includes('thepioneerwoman.com/cooking/')) {
    throw new Error("url provided must include 'thepioneerwoman.com/cooking/'");
  }

  return rp({
    uri: url,
    transform(body) {
      return cheerio.load(body);
    },
  }).then(($) => {
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

    const imageUrl = $('.entry-content')
      .children('p')
      .first()
      .children('a')
      .first()
      .attr('href');

    return {
      ingredients,
      directions,
      time,
      imageUrl,
      sourceName: 'The Pioneer Woman',
      name: $('.recipe-title').first().text(),
      servings: times.last().text(),
      publishDate: $('.entry-date.published').attr('datetime'),
    };
  }).catch(() => {
    throw new Error('There was a problem retrieving the page');
  });
};
