const populate = require('./populate');
const traverse = require('./traverse');
const config = require('./../environmentConfig');

function seedDB(dbConnection) {
  return populate(traverse(config.PATH_TO_DRIVE), dbConnection);
}

module.exports = {
  seedDB,
};
