const populate = require('./populate');
const traverse = require('./traverse');
const config = require('./../environmentConfig');
const { PATH_TO_DRIVE } = require('./../constants');

function seedDB(dbConnection) {
  return populate(traverse(PATH_TO_DRIVE), dbConnection);
}

module.exports = {
  seedDB,
};
