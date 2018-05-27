const express = require('express')
const RouterHub = require('./routes/RouterHub');

class RootServer {

    constructor(port) {
        this.PORT = port
        this.server;
        this.app;
        this.HOST = '0.0.0.0';
        this.router = new RouterHub();
    }

    init() {
        this.app = express();

        this.app.use('/', this.router.getRouter());
        this.app.use('/admin', this.router.getAdminRouter());

        this.server = this.app.listen(this.PORT);
        console.log(`Running on http://${this.HOST}:${this.PORT}`);
    }

    close() {
        this.server.close();
    }
}

module.exports = RootServer;
