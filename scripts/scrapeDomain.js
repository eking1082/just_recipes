const Promise = require('bluebird');
const { Page } = require('../models');

const domain = process.argv[2];
const reScrape = process.argv[3] === '-r';
if (!domain) {
  console.log('Domain is required');
  process.exit();
}

const scraper = require('./scrapers')(domain);

const pageQuery = { domain, ignore: false };
if (!reScrape) pageQuery.scraped = false;

Page.find(pageQuery)
  .then((pages) => {
    console.log(`Found ${pages.length} page(s) to scrape`);
    return Promise.map(pages, scraper.scrapeRecipe, { concurrency: 50 });
  })
  .catch((err) => console.error(err))
  .finally(() => process.exit());
