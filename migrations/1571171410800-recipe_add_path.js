const _ = require('lodash');
const Promise = require('bluebird');
const { Recipe } = require('../models');

const sourceAbbreviations = {
  thepioneerwoman: 'tpw',
  smittenkitchen: 'sk',
  grannysvitalvittles: 'gvv',
};

async function up() {
  const recipes = await Recipe.find();
  await Promise.map(recipes, (recipe) => {
    recipe.path = _.kebabCase(`${recipe.name}-${sourceAbbreviations[recipe.source.domain]}`);
    return recipe.save();
  });
}

async function down() {
  console.log('No down required');
}

module.exports = { up, down };
