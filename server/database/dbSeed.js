const populate = require('./populate');
const traverse = require('./traverse');

async function seedDB(dbConnection, path) {
  return populate(await traverse(path), dbConnection);
}

module.exports = {
  seedDB,
};
