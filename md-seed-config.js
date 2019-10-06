const mongoose = require('mongoose');
const Recipes = require('./seeders/recipes.seeder');

const mongoURL = 'mongodb://localhost:27017/just_recipes';

/**
 * Seeders List
 * order is important
 * @type {Object}
 */
const seedersList = {
  Recipes,
};

/**
 * Connect to mongodb implementation
 * @return {Promise}
 */
const connect = () => mongoose.connect(mongoURL, { useNewUrlParser: true });

/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
const dropdb = async () => mongoose.connection.db.dropDatabase();

module.exports = {
  seedersList,
  connect,
  dropdb,
};
