const { savePage } = require('./utils');

savePage('https://thepioneerwoman.com/cooking/good-ol-basic-chocolate-chip-cookies/')
  .then(() => {
    console.log('DONE');
    process.exit();
  })
  .catch((err) => {
    console.log('ERROR');
    console.error(err);
    process.exit();
  });
