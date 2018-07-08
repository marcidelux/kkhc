'use strict';

const config = require('./envConfig');
const RootServer = require('./RootServer');
const connectToDb = require('./database/folderModel');

console.log(config)

connectToDb(config).then((connectionEstablished) => {
	const server = new RootServer(config.EXPRESS_PORT, connectionEstablished);
	server.init();
})


