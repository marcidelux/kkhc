'use strict';

const connectToDb = require('./folderModel');
const config = require('./../envConfig');
const populate = require('./populate');
const mongoose = require('mongoose');
const traverse = require('./traverser');

function runSeed() { 
  connectToDb(config).then(async (connectionEstablished) => {
    await populate(traverse('/opt/images'), connectionEstablished);
    await connectionEstablished.disconnect();
    return "database seeded";
  })
  .catch(err => {
    return "error seeding database";
  });
}

module.exports = {
  runSeed
}