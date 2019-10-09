const parseDomain = require('parse-domain');
const thepioneerwoman = require('./thepioneerwoman');

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
  // smittenkitchen: require('./smittenkitchen'),
  thepioneerwoman,
  // therealfoodrds: require('./therealfoodrds'),
  // thespruceeats: require('./thespruceeats'),
  // whatsgabycooking: require('./whatsgabycooking'),
  // yummly: require('./yummly'),
};

const scraper = (url) => {
  const { domain } = parseDomain(url);
  if (!domains[domain]) throw new Error('Site not yet supported');

  return domains[domain](url)
    .then((recipe) => {
      if (!recipe.name || !recipe.ingredients.length || !recipe.directions.length) {
        throw new Error('No recipe found on page');
      }

      return recipe;
    });
};

module.exports = scraper;
