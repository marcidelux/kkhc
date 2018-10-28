const populate = require('./populate');
const traverse = require('./traverse');

function seedDB(dbConnection, path) {
  return populate(traverse(path), dbConnection);
}

module.exports = {
  seedDB,
};
