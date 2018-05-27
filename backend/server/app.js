const config = require('./config/envConfig');
const RootServer = require('./RootServer');

const server = new RootServer(config.PORT);
server.init();
