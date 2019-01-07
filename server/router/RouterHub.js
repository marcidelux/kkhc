const express = require('express');
const RoutesInitializer = require('./RoutesInitializer');

class RouterHub {
  constructor(dbConnection) {
    this.router = express.Router();
    this.routeObject = new RoutesInitializer(dbConnection);
    this.routeObject.loadRoutes().then((routes) => {
      this.routes = routes;
      this.initializeRoutes();
    });
  }

  getRouter() {
    return this.router;
  }

  initializeRoutes() {
    this.routes.forEach(route => this.router[route.method](route.path, route.controller));
  }
}

module.exports = RouterHub;
