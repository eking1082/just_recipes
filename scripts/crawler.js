require('colors');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = require('glob');
const moment = require('moment');
const onDeath = require('death');
const Crawler = require('simplecrawler');
const ProgressBar = require('progress');
const { Recipe } = require('../models');

const domain = process.argv[2];
const reScrape = process.argv.includes('-r');
const verbose = process.argv.includes('-v');
const clean = process.argv.includes('--clean');
const ignoreWhitelist = process.argv.includes('--ignore-wl');
const saveRecipes = !process.argv.includes('--no-save');
if (!domain) {
  console.log('Please provide a domain to crawl'.red);
  process.exit();
}

let scraper;
try {
  // eslint-disable-next-line global-require
  scraper = require('../scrapers')(domain);
} catch (e) {
  console.log('Provided domain is not supported'.red);
  process.exit();
}

let state = {
  pathsWithRecipes: [],
  pageStats: {
    recipeCount: 0,
    existingCount: 0,
    failedCount: 0,
  },
};

let progress;
const crawler = new Crawler(scraper.baseUrl);
crawler.discoverResources = scraper.discoverResources;
crawler.timeout = 5000;

const addErrorEventHandler = (eventName) => {
  crawler.on(eventName, (queueItem, e) => {
    progress.interrupt(`${eventName} - ${e}\n${util.inspect(queueItem)}`.red);
  });
};

crawler.addDownloadCondition((queueItem) => {
  const { contentType } = queueItem.stateData;
  return contentType && !contentType.startsWith('image/');
});
crawler.addDownloadCondition((queueItem) => {
  const { contentLength } = queueItem.stateData;
  return contentLength < 1000000; // 1mb
});
if (!ignoreWhitelist && scraper.pathWhitelist.length !== 0) {
  crawler.addFetchCondition((queueItem) => scraper.pathWhitelisted(queueItem.uriPath));
}

if (verbose) {
  crawler.on('fetchdisallowed', (queueItem) => progress.interrupt(`fetchdisallowed - ${queueItem.url}`.yellow));
  crawler.on('fetchtimeout', (queueItem, timeout) => progress.interrupt(`fetchtimeout - ${timeout}ms - ${queueItem.url}`.yellow));
  crawler.on('fetchdataerror', (queueItem) => progress.interrupt(`fetchdataerror - file too large - ${queueItem.url}`.yellow));
  crawler.on('fetchprevented', (queueItem) => progress.interrupt(`fetchprevented - ${queueItem.url}`.yellow));
  crawler.on('downloadprevented', (queueItem) => progress.interrupt(`downloadprevented - ${queueItem.url}`.yellow));
}

crawler.on('queueerror', (e, queueItem) => progress.interrupt(`queueerror - ${e}\n${util.inspect(queueItem)}`.red));
crawler.on('robotstxterror', (e) => progress.interrupt(`robotstxterror - ${e}`.red));
addErrorEventHandler('fetchclienterror');
addErrorEventHandler('fetchconditionerror');
addErrorEventHandler('cookieerror');
addErrorEventHandler('downloadconditionerror');

crawler.on('crawlstart', async () => {
  if (clean) {
    console.log('Starting from clean state'.green);
  } else {
    glob(`/tmp/crawler_queue_${domain}*.json`, {}, (e, files) => {
      if (e) throw e;
      if (files.length === 0) {
        console.log('No saved state found'.yellow);
        return;
      }

      const crawlerQueue = files.sort().reverse()[0];
      crawler.queue.defrost(crawlerQueue, (e) => {
        if (e) throw e;
        state = JSON.parse(fs.readFileSync(crawlerQueue.replace('_queue_', '_state_')));
        console.log(`Continuing from ${crawlerQueue}`.green);
      });
    });
  }

  progress = new ProgressBar('|:bar| (:percent) :current/:total | Est: :eta (:elapsed) | Recipes: :recipeCount Existing: :existingCount Failed: :failedCount', {
    total: 10,
    width: 100,
  });
});

crawler.on('fetchcomplete', async (queueItem, responseBuffer) => {
  if (!queueItem.stateData.contentType.startsWith('text/html')) return;

  const path = `${queueItem.uriPath.split('/')[1]}`;
  if (!reScrape) {
    const recipe = await Recipe.findOne({ 'source.url': queueItem.url });
    if (recipe) {
      progress.interrupt(`Recipe already exists - ${recipe.name}`);
      state.pageStats.existingCount++;
      state.pathsWithRecipes.push(path);
      return;
    }
  }

  try {
    let recipe = await scraper.scrapeRecipe(queueItem.url, responseBuffer.toString());
    if (!recipe.name || recipe.ingredients.length === 0 || recipe.directions.length === 0) {
      progress.interrupt(`No recipe found - ${queueItem.url}`);
      return;
    }

    if (saveRecipes) {
      await Recipe.findOneAndDelete({ 'source.url': queueItem.url });
      recipe.path = _.kebabCase(`${recipe.name}-${scraper.abbreviatedSourceName}`);
      recipe = new Recipe(recipe);
      await recipe.save();

      progress.interrupt(`Recipe saved - ${recipe.name}`.green);
    } else {
      progress.interrupt(`Recipe found - ${recipe.name} - ${queueItem.url}`.green);
    }

    state.pageStats.recipeCount++;
    state.pathsWithRecipes.push(path);
  } catch (e) {
    if (e.name === 'ValidationError') {
      progress.interrupt(`${e.message} - ${queueItem.url}`.red);
      state.pageStats.failedCount++;
    }
    console.error(e);
  }
});

const tickProgress = () => {
  progress.tick(state.pageStats);
  crawler.queue.getLength((e, length) => {
    if (e) throw e;
    progress.total = length;
  });
  crawler.queue.countItems({ fetched: true }, (e, fetchedCount) => {
    if (e) throw e;
    progress.curr = fetchedCount;
  });
};

const logComplete = () => {
  console.log(`  Added ${state.pageStats.recipeCount} recipe(s)`.green);
  console.log(`  Ignored ${state.pageStats.existingCount} recipe(s)`.yellow);
  if (state.pageStats.failedCount > 0) console.log(`  ${state.pageStats.failedCount} recipe(s) failed`.red);
};

const cleanSavedState = (callback, ignoreFileName) => {
  glob(`/tmp/crawler_*${domain}*.json`, {}, (e, files) => {
    if (e) throw e;
    if (files.length !== 0) {
      files
        .filter((file) => !file.includes(ignoreFileName))
        .forEach((file) => fs.unlinkSync(file));
    }
    callback();
  });
};

const saveState = (callback) => {
  const fileName = `${domain}_${moment().format()}`;
  crawler.queue.freeze(path.join('/tmp', `crawler_queue_${fileName}.json`), (e) => {
    if (e) callback(e, 'Failed to save crawler state'.red);

    fs.writeFileSync(path.join('/tmp', `crawler_state_${fileName}.json`), JSON.stringify(state));
    cleanSavedState(() => callback(null, 'Successfully saved crawler state'.green), fileName);
  });
};

const progressInterval = setInterval(() => tickProgress(), 500);
const saveStateInterval = setInterval(() => {
  saveState((e, message) => {
    if (e) {
      progress.interrupt(message);
      progress.interrupt(e);
    } else {
      progress.interrupt(message);
    }
  });
}, 900000 /* 15 minutes */);

onDeath((signal) => {
  tickProgress();
  clearInterval(saveStateInterval);
  clearInterval(progressInterval);

  console.log(`\n\nReceived ${signal} signal, attempting to save crawler state.`.red);
  logComplete();
  saveState((e, message) => {
    if (e) {
      console.log(message);
      console.error(e);
    } else {
      console.log(message);
    }
    process.exit();
  });
});

crawler.on('complete', () => {
  tickProgress();
  clearInterval(saveStateInterval);
  clearInterval(progressInterval);

  cleanSavedState(() => {
    console.log('\nFinished crawling'.green);
    logComplete();
    if (ignoreWhitelist || scraper.pathWhitelist.length === 0) {
      console.log('These paths had recipes, whitelist them: ', state.pathsWithRecipes);
    }
    process.exit();
  });
});

crawler.start();
