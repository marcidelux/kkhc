'use strict';

const populate = require('./populate');
const traverse = require('./traverser');

function seedDB(dbConnection) {
  return populate(traverse('/opt/images'), dbConnection);
};

module.exports = {
  seedDB
}
