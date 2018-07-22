'use strict';

const connectToDb = require('./connectToDb');
const config = require('./../envConfig');
const populate = require('./populate');
const traverse = require('./traverser');

connectToDb(config).then(async (connectionEstablished) => {
  await populate(traverse('/opt/images'), connectionEstablished)
  await connectionEstablished.disconnect()
});