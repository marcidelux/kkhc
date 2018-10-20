const populate = require('./populate');
const traverse = require('./traverser');
const config = require('./../environmentConfig');

function seedDB(dbConnection) {
  return populate(traverse(config.PATH_TO_DRIVE), dbConnection);
}

module.exports = {
  seedDB,
};
