const url = require('url');
const cheerio = require('cheerio');

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

const discoverResources = (buffer, queueItem) => {
  const $ = cheerio.load(buffer.toString('utf8'));
  return $('a[href]')
    .map((i, el) => $(el).attr('href'))
    .filter((i, el) => url.parse(el).pathname !== queueItem.uriPath)
    .get();
};

const scraper = (domain) => ({
  baseUrl: domains[domain].baseUrl,
  sourceName: domains[domain].sourceName,
  discoverResources: domains[domain].discoverResources || discoverResources,
  pathWhitelist: domains[domain].pathWhitelist || [],

  pathWhitelisted: (path) =>
    domains[domain].pathWhitelist.some((wlPath) => path.startsWith(`/${wlPath}/`)),

  scrapeRecipe: async (url, html) => {
    const $ = cheerio.load(html);
    const { sourceName, ...recipe } = domains[domain].scrapeRecipe($);

    if (recipe.servings) recipe.servings = parseInt(recipe.servings.match(/[0-9]+/)[0]);
    recipe.source = { domain, url, name: sourceName };

    return recipe;
  },
});

module.exports = scraper;
