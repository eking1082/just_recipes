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

const discoverResources = (buffer) => {
  const $ = cheerio.load(buffer.toString('utf8'));
  return $('a[href]').map((i, el) => $(el).attr('href')).get();
};

const scraper = (domain) => ({
  baseUrl: domains[domain].baseUrl,
  discoverResources: domains[domain].discoverResources || discoverResources,
  pathWhitelist: domains[domain].pathWhitelist,

  pathWhitelisted: (path) =>
    domains[domain].pathWhitelist.some((wlPath) => path.startsWith(`/${wlPath}/`)),

  scrapeRecipe: async (url, html) => {
    const $ = cheerio.load(html);
    const { sourceName, ...recipe } = domains[domain].scrapeRecipe($);
    if (!recipe.name || recipe.ingredients.length === 0 || recipe.directions.length === 0) {
      return { status: 'no_recipe', message: `No recipe found - ${url}` };
    }

    const servingsMatch = recipe.servings.match(/[0-9]+/);
    recipe.servings = servingsMatch ? servingsMatch[0] : null;
    recipe.source = { domain, url, name: sourceName };

    try {
      await Recipe.findOneAndDelete({ 'source.url': url });
      const recipeRecord = new Recipe(recipe);
      await recipeRecord.save();

      return { status: 'success', message: `Recipe saved - ${recipeRecord.name}`, recipeRecord };
    } catch (e) {
      if (e.name === 'ValidationError') {
        return { status: 'failed', message: `${e.message} - ${url}` };
      }
      throw e;
    }
  },
});

module.exports = scraper;
