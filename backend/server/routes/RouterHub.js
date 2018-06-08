const cors = require('cors');
const express = require('express');
// @???

class RouterHub {
    

    constructor() {
        this.router = express.Router();
        this.AdminRouter = express.Router();
        this.initializeRoutes();
    }

    getRouter() {
        return this.router;
    }

    getAdminRouter() {
        return this.AdminRouter;
    }

    initializeRoutes() {
        this.router.use(cors());
        this.router.use(express.json());
        const routes = require('./basic/endpoints');
        routes.forEach((route) => {
            this.router[route.method](route.path, route.controller);
        });
        const adminRoutes = require('./admin/endpoints');
        adminRoutes.forEach((route) => {
            this.AdminRouter[route.method](route.path, route.controller);
        });
    }
}

module.exports = RouterHub;
