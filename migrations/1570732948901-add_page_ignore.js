const { Page } = require('../models');

async function up() {
  return Page.updateMany({}, { ignore: false });
}

async function down() {
}

module.exports = { up, down };
