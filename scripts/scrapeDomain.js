require('dotenv/config');
require('../config/mongoose');
const { crawlNewRecipes, scrapeRecipe } = require('../scrapers');

const domain = process.argv[2];
if (!domain) {
  console.log('Domain is required');
  process.exit();
}

// TODO:
//  - get list of recipe urls to crawl
//  - ignore recipes that have already been retrieved

crawlNewRecipes(domain)
  .then((recipeUrls) => {
    process.exit();
    // return scrapeRecipe(recipeUrls[0]);
  })
  .then(() => {
    process.exit();
  })
  .catch((err) => {
    console.error('ERROR', err);
    process.exit();
  });
