/* eslint-disable class-methods-use-this */
const { Seeder } = require('mongoose-data-seed');
const Recipe = require('../models/Recipe');

const source = {
  sourceName: 'The Pioneer Woman',
  sourceUrl: '#',
};
const ingredients = [
  '1/2 cup Margarine',
  '1/2 cup Butter, Softened',
  '1 cup Firmly Packed Brown Sugar',
  '1/2 cup White Sugar',
  '2 whole Eggs',
  '2 teaspoons Vanilla Extract',
  '2-1/4 cups Plus 2 Tablespoons, All-purpose Flour',
  '1 teaspoon (heaping) Instant Coffee Granules',
  '1 teaspoon Baking Soda',
  '1-1/2 teaspoon Salt',
  '2 Tablespoons Flax Seed, Slightly Crushed With Rolling Pin',
  '3/4 cups Semi-Sweet Chocolate Chips',
  '1 cup (heaping) Milk Chocolate Chips',
  '2 teaspoons Vanilla Extract',
  '2-1/4 cups Plus 2 Tablespoons, All-purpose Flour',
  '1 teaspoon (heaping) Instant Coffee Granules',
];
const data = [
  {
    name: 'Chocolate Chip Cookies',
    image: '//placehold.it/500x280',
    popularityScore: 50,
    ingredients,
    ...source,
  },
  {
    name: 'Mint Chocolate Chip Cookies',
    image: '//placehold.it/500x300',
    popularityScore: 25,
    ingredients: ingredients.slice(2, 7),
    ...source,
  },
  {
    name: 'Oatmeal Chocolate Chip Cookies',
    image: '//placehold.it/500x250',
    popularityScore: 10,
    ingredients: ingredients.slice(5, 15),
    ...source,
  },
  {
    name: 'Potato Chips',
    image: '//placehold.it/500x280',
    popularityScore: 75,
    ingredients: ingredients.slice(1, 3),
    ...source,
  },
  {
    name: 'German Chocolate Cake',
    image: '//placehold.it/500x350',
    popularityScore: 90,
    ingredients: ingredients.slice(0, 10),
    ...source,
  },
  {
    name: 'Carrot Cake',
    image: '//placehold.it/500x280',
    popularityScore: 75,
    ingredients: ingredients.slice(5, 10),
    ...source,
  },
  {
    name: 'Red Velvet Cake',
    image: '//placehold.it/500x280',
    popularityScore: 15,
    ingredients: ingredients.slice(7, 13),
    ...source,
  },
  {
    name: 'Peanut Butter Cookies',
    image: '//placehold.it/500x280',
    popularityScore: 85,
    ingredients: ingredients.slice(6, 15),
    ...source,
  },
];

class RecipesSeeder extends Seeder {
  async shouldRun() {
    return Recipe.countDocuments().exec().then((count) => count === 0);
  }

  async run() {
    return Recipe.create(data);
  }
}

module.exports = RecipesSeeder;
