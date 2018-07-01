'use strict';

const conf = require('./envConfig');
const RootServer = require('./RootServer');

console.log(conf)

const server = new RootServer(conf.EXPRESS_PORT);
server.init();
