const connectToDb = require('./folderModel');
const config = require('./../envConfig');
const populate = require('./populate');
const mongoose = require('mongoose');
const traverse = require('./traverser');


connectToDb(config).then(async (connectionEstablished) => {
  await populate(traverse('/opt/images'), connectionEstablished)
  await connectionEstablished.disconnect()
})
