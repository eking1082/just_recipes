const fs = require('fs');
const rp = require('request-promise');
const glob = require('glob');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const scraperFactory = require('../../scrapers');

const { expect } = chai;
chai.use(chaiExclude);

describe('#pathWhitelisted', () => {
  it('should return true for whitelisted path', () => {
    expect(scraperFactory('thepioneerwoman').pathWhitelisted('/cooking/')).to.be.true;
  });

  it('should return false for non whitelisted path', () => {
    expect(scraperFactory('thepioneerwoman').pathWhitelisted('/not_whitelisted/')).to.be.false;
  });
});

describe('#discoverResources', () => {
  it('should discover the correct resources on the page', () => {
    const scraper = scraperFactory('thepioneerwoman');
    const buffer = fs.readFileSync('test/scrapers/fixtures/discoverResources.html');
    expect(scraper.discoverResources(buffer, { uriPath: '/cooking/page/2/' }).length).to.equal(243);
  });
});

const commonRecipeTest = (scraper, domainConstants) => {
  describe(`${domainConstants.sourceName} Scraper`, () => {
    it('should have the correct configuration', () => {
      expect(scraper.baseUrl).to.equal(domainConstants.baseUrl);
      expect(scraper.sourceName).to.equal(domainConstants.sourceName);
      expect(scraper.pathWhitelist).to.be.an('array');
    });

    describe('#scrapeRecipe', () => {
      domainConstants.recipes.forEach(({ url, expectedRecipe, publishDate }) => {
        it(`should fetch the expected recipe from ${url}`, async () => {
          const html = await rp(url);
          const recipe = await scraper.scrapeRecipe(url, html);
          expect(recipe).excluding('publishDate').to.deep.equal(expectedRecipe);
          if (publishDate) expect(recipe.publishDate.format('YYYY-MM-DD')).to.equal(publishDate);
        });
      });
    });
  });
};

glob(`${__dirname}/domains/*.js`, {}, (e, files) => {
  if (e) throw e;

  files.forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const domainConstants = require(file);
    commonRecipeTest(scraperFactory(domainConstants.domain), domainConstants);
  });
});
