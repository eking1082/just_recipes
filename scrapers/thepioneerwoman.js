const rp = require('request-promise');
const cheerio = require('cheerio');

const thePioneerWoman = (url) => {
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

    return {
      ingredients,
      directions,
      time,
      sourceName: 'The Pioneer Woman',
      name: $('.recipe-title').first().text(),
      servings: times.last().text(),
      imageUrl: $('.recipe-summary-thumbnail').first().children('img').attr('src'),
    };
  }).catch(() => {
    throw new Error('There was a problem retrieving the page');
  });
};

module.exports = thePioneerWoman;
