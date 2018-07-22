'use strict';

const config = require('./envConfig');
const RootServer = require('./RootServer');
const connectToDb = require('./database/connectToDb');

connectToDb(config).then((connectionEstablished) => {
	console.log(connectionEstablished);
	const server = new RootServer(config.EXPRESS_PORT, connectionEstablished);
	server.init();
})


