const Promise = require('bluebird');

const domain = process.argv[2];
const reCrawl = process.argv[3] === '-r';
if (!domain) {
  console.log('Domain is required');
  process.exit();
}

const scraper = require('./scrapers')(domain);

scraper.crawlNewRecipes(reCrawl)
  .then((recipeUrls) => Promise.map(recipeUrls, scraper.savePage, { concurrency: 50 }))
  .catch((err) => console.error(err))
  .finally(() => process.exit());
