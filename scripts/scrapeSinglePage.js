const url = require('url');

const pageUrl = process.argv[2];
if (!pageUrl) {
  console.log('url is required');
  process.exit();
}

const domain = url.parse(pageUrl).host.split('.')[0];
const scraper = require('./scrapers')(domain);

scraper.savePage(pageUrl)
  .then((page) => scraper.scrapeRecipe(page))
  .catch((err) => console.error(err))
  .finally(() => process.exit());
