const Recipe = require('../models/Recipe');
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

exports.crawlNewRecipes = (domain) => {
  console.log(`Crawling ${domain} for new recipes`);

  return Recipe.findOne({ 'source.domain': domain })
    .sort({ publishDate: 'desc' })
    .select('publishDate -_id')
    .then(({ publishDate: fromDate }) => {
      console.log(`Searching from date: ${fromDate}`);
      return domains[domain].crawlNewRecipes(fromDate);
    })
    .then((recipeUrls) => {
      console.log(`Found ${recipeUrls.length} new recipes`);
      console.log(recipeUrls);
      return recipeUrls;
    });
};

exports.scrapeRecipe = (domain, url) => {
  console.log(`Retrieving recipe - ${url}`);
  return domains[domain].scrapeRecipe(url)
    .then(({
      name, ingredients, directions, sourceName, imageUrl, time, servings, publishDate,
    }) => {
      if (!name || !ingredients.length || !directions.length) {
        throw new Error('No recipe found on page');
      }

      const recipe = new Recipe({
        name,
        ingredients,
        directions,
        time,
        servings,
        publishDate,
        source: {
          url,
          domain,
          name: sourceName,
        },
        image: imageUrl,
      });

      return recipe.save();
    })
    .then((recipe) => {
      console.log(`RECIPE SAVED - ${recipe.name}`);
      console.log(recipe);
    });
};
