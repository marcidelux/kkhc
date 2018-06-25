'use strict';

const conf = require('./envConfig');

const RootServer = require('./RootServer');

const mongoose = require('mongoose');
console.log(conf)

const server = new RootServer(conf.EXPRESS_PORT);

server.init();

mongoose.connect(`mongodb://${conf.MONGO_INITDB_ROOT_USERNAME}:${conf.MONGO_INITDB_ROOT_PASSWORD}@db:27017/${conf.MONGO_INITDB_DATABASE}?authSource=admin`);
