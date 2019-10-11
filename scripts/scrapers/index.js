const cheerio = require('cheerio');
const { Recipe } = require('../../models');

/* eslint-disable global-require */
const domains = {
  // '101cookbooks': require('./101cookbooks'),
  // allrecipes: require('./allrecipes'),
  // ambitiouskitchen: require('./ambitiouskitchen'),
  // bbc: require('./bbc'),
  // bbcgoodfood: require('./bbcgoodfood'),
  // bonappetit: require('./bonappetit'),
  // budgetbytes: require('./budgetbytes'),
  // closetcooking: require('./closetcooking'),
  // cookieandkate: require('./cookieAndKate'),
  // copykat: require('./copykat'),
  // eatingwell: require('./eatingwell'),
  // epicurious: require('./epicurious'),
  // finecooking: require('./finecooking'),
  // food: require('./food'),
  // foodandwine: require('./foodandwine'),
  // foodnetwork: require('./foodnetwork'),
  // gimmesomeoven: require('./gimmesomeoven'),
  // myrecipes: require('./myrecipes'),
  // seriouseats: require('./seriouseats'),
  // simplyrecipes: require('./simplyrecipes'),
  smittenkitchen: require('./smittenkitchen'),
  thepioneerwoman: require('./thepioneerwoman'),
  // therealfoodrds: require('./therealfoodrds'),
  // thespruceeats: require('./thespruceeats'),
  // whatsgabycooking: require('./whatsgabycooking'),
  // yummly: require('./yummly'),
};
/* eslint-enable global-require */

const scraper = (domain) => ({
  baseUrl: domains[domain].baseUrl,
  pathBlacklisted: (path) => domains[domain].pathBlacklist
    .some((blacklistedPath) => path.startsWith(blacklistedPath)),

  scrapeRecipe: async (url, html) => {
    const $ = cheerio.load(html);
    const { sourceName, ...recipe } = domains[domain].scrapeRecipe($);
    if (!recipe.name || recipe.ingredients.length === 0 || recipe.directions.length === 0) {
      // console.log(`No recipe found - ${url}`);
      return null;
    }

    const servingsMatch = recipe.servings.match(/[0-9]+/);
    recipe.servings = servingsMatch ? servingsMatch[0] : null;
    recipe.source = { domain, url, name: sourceName };

    try {
      let recipeRecord = await Recipe.findOne({ 'source.url': url });
      if (recipeRecord) {
        recipeRecord.update(recipe);
      } else {
        recipeRecord = new Recipe(recipe);
      }
      await recipeRecord.save();

      // console.log(`Recipe saved - ${recipeRecord.name}`);
      return recipeRecord;
    } catch (e) {
      if (e.name === 'ValidationError') {
        // console.error(`${e.message} - ${url}`);
        return null;
      }
      throw e;
    }
  },
});

module.exports = scraper;
