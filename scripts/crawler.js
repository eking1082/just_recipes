const Crawler = require('simplecrawler');
const _cliProgress = require('cli-progress');
const { Recipe } = require('../models');

const domain = process.argv[2];
const reScrape = process.argv.includes('-r');
if (!domain) {
  console.log('Please provide a domain to crawl');
  process.exit();
}

const scraper = require('./scrapers')(domain);

if (!scraper) {
  console.log('Provided domain is not supported');
  process.exit();
}

const pathsWithRecipes = {
  '': true, // ignore home
};

const updatePathsWithRecipes = (path, hasRecipe) => {
  if (Object.keys(pathsWithRecipes).includes(path)) {
    if (hasRecipe) pathsWithRecipes[path] = true;
  } else {
    pathsWithRecipes[path] = hasRecipe;
  }
};

let progress;
const crawler = new Crawler(scraper.baseUrl);
// crawler.maxConcurrency = 1; // default 5
crawler.maxDepth = 2;
// crawler.interval = 3000;

crawler.addDownloadCondition((queueItem, response) => !response.headers['content-type'].startsWith('image/'));

crawler.on('crawlstart', () => {
  progress = new _cliProgress.SingleBar({
    format: '| {bar} | {percentage}% | {value}/{total} Pages | Open Requests: {openRequests}',
    barIncompleteChar: '-',
    clearOnComplete: true,
  }, _cliProgress.Presets.rect);
  progress.start(10000, 0, { openRequests: 0 });
});

crawler.on('fetchcomplete', async (queueItem, responseBuffer, response) => {
  if (!response.headers['content-type'].startsWith('text/html') || scraper.pathBlacklisted(queueItem.uriPath)) {
    return;
  }

  const path = `${queueItem.uriPath.split('/')[1]}`;
  if (!reScrape) {
    const recipe = await Recipe.findOne({ 'source.url': queueItem.url });
    if (recipe) {
      // console.log(`Recipe already exists - ${recipe.name}`);
      updatePathsWithRecipes(path, true);
      return;
    }
  }

  const recipe = await scraper.scrapeRecipe(queueItem.url, responseBuffer.toString());
  updatePathsWithRecipes(path, !!recipe);
});

crawler.start();

const barInterval = setInterval(() => {
  crawler.queue.getLength((e, length) => {
    if (e) throw e;
    progress.setTotal(length);
  });

  crawler.queue.countItems({ fetched: true }, (e, fetchedCount) => {
    if (e) throw e;
    progress.update(fetchedCount, {
      openRequests: crawler._openRequests.length,
    });
  });
}, 1000);

crawler.on('complete', () => {
  clearInterval(barInterval);
  progress.stop();

  console.log('Finished crawling');
  console.log('These paths had no recipes, blacklist them for improved performance: ',
    Object.keys(pathsWithRecipes).filter((key) => !pathsWithRecipes[key]));

  process.exit();
});
