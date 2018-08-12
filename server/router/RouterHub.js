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

  static redirect(req, res, next) {
    if (req.session.authenticated) {
      return next();
    }
    req.session.authenticated = false;
    res.redirect('/');
    return false;
  }

  getRouter() {
    return this.router;
  }

  initializeRoutes() {
    this.routes.forEach((route) => {
      route.auth
        ? this.router[route.method](route.path, this.constructor.redirect, route.controller)
        : this.router[route.method](route.path, route.controller);
    });
  }
}

module.exports = RouterHub;
