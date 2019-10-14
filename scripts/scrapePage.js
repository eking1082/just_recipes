const url = require('url');
const rp = require('request-promise');

const pageUrl = process.argv[2];
if (!pageUrl) {
  console.log('url is required');
  process.exit();
}

const domain = url.parse(pageUrl).host.split('.')[0];
const scraper = require('../scrapers')(domain);

rp(pageUrl)
  .then((html) => scraper.scrapeRecipe(pageUrl, html))
  .then((recipe) => console.log(recipe))
  .catch((err) => console.error(err))
  .finally(() => process.exit());
