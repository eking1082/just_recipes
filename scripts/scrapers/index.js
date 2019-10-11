const fs = require('fs').promises;
const rp = require('request-promise');
const path = require('path');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const cheerio = require('cheerio');
const numeral = require('numeral');

const { Page, Recipe } = require('../../models');

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
  // smittenkitchen: require('./smittenkitchen'),
  thepioneerwoman: require('./thepioneerwoman'),
  // therealfoodrds: require('./therealfoodrds'),
  // thespruceeats: require('./thespruceeats'),
  // whatsgabycooking: require('./whatsgabycooking'),
  // yummly: require('./yummly'),
};
/* eslint-enable global-require */

const pagePath = (uuid) => path.join(__dirname, 'pages', `${uuid}.html`);

const scraper = (domain) => ({
  domain,

  crawlNewRecipes: async (ignoreNewestRecipe) => {
    console.log(`Crawling ${domain} for new recipes`);

    const newestRecipe = await Recipe.findOne({ 'source.domain': domain }).sort({ publishDate: 'desc' });
    const fromDate = moment((!ignoreNewestRecipe && newestRecipe) ? newestRecipe.publishDate : '1970-01-01');
    console.log(`Searching from date: ${fromDate}`);

    const recipeUrls = [];
    let fromDateReached = false;
    let nextPageUrl;
    do {
      // eslint-disable-next-line no-await-in-loop
      const result = await domains[domain].scrapeRecipeIndex(nextPageUrl);
      nextPageUrl = result.nextPageUrl;
      console.log('Next page: ', nextPageUrl);

      const urls = result.recipes.reduce((acc, { url, date }) => {
        if (date > fromDate) acc.push(url);
        return acc;
      }, []);

      recipeUrls.push(...urls);
      fromDateReached = result.recipes.length !== urls.length;
      console.log(`Added ${urls.length} recipes from index`);
    } while (!fromDateReached && nextPageUrl);
    console.log(`Found ${recipeUrls.length} new recipes`);

    return recipeUrls;
  },

  savePage: async (url) => {
    try {
      const page = await Page.findOneAndUpdate({ domain, url }, { domain, url }, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      });

      if (!page.uuid) {
        page.uuid = uuidv4();
        await page.save();
      } else {
        try {
          await fs.readFile(pagePath(page.uuid));
          console.log(`Page has already been retrieved - ${url}`);
          return page;
        } catch (e) {
          if (e.code !== 'ENOENT') throw e;
        }
      }

      const html = await rp(url);
      console.log(`Retrieved page - ${url}`);

      await fs.writeFile(pagePath(page.uuid), html);
      return page;
    } catch (e) {
      console.log(e);
    }
  },

  scrapeRecipe: async (page) => {
    console.log(`Scraping recipe - ${page.url}`);
    const html = await fs.readFile(pagePath(page.uuid));
    const $ = cheerio.load(html);

    try {
      const {
        name, ingredients, directions, sourceName, imageUrl, thumbnailUrl, time, servings,
        publishDate,
      } = domains[domain].scrapeRecipe($);

      await Recipe.findOneAndUpdate({
        'source.url': page.url,
      }, {
        name,
        ingredients,
        directions,
        time,
        publishDate,
        imageUrl,
        thumbnailUrl,
        source: {
          domain,
          url: page.url,
          name: sourceName,
        },
        servings: numeral(servings).value(),
      }, {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      });

      console.log(`RECIPE SAVED - ${name}`);
      page.scraped = true;
      return page.save();
    } catch (e) {
      if (e.name === 'ValidationError') {
        const failedKeys = Object.keys(e.errors);
        if (failedKeys.some((key) => ['name', 'directions', 'ingredients'].includes(key))) {
          console.log(`No recipe found on page - ${page.url}`);
          page.ignore = true;
          return page.save();
        }
        console.log(`Unable to find required keys: ${failedKeys.join(', ')} - ${page.url}`);
      } else {
        throw e;
      }
    }
  },
});

module.exports = scraper;
