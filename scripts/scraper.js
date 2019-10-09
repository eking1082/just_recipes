require('dotenv/config');
require('../config/mongoose');

const scraper = require('../scrapers');
const Recipe = require('../models/Recipe');

const url = 'https://thepioneerwoman.com/cooking/french-dip-sandwiches/';

// TODO:
//  - get list of recipe urls to crawl
//  - ignore recipes that have already been retrieved

console.log(process.argv[2]);

scraper(url)
  .then((result) => {
    const recipe = new Recipe({
      name: result.name,
      ingredients: result.ingredients,
      source: {
        name: result.sourceName,
        url,
      },
      image: result.imageUrl,
      directions: result.directions,
      time: result.time,
      servings: result.servings,
    });
    console.log(recipe);
    return recipe.save();
  }).then((recipe) => {
    console.log('RECIPE SAVED', recipe);
    process.exit();
  }).catch((err) => {
    console.log('ERROR');
    console.error(err);
    process.exit();
  });
