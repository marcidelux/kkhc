'use strict';

const express = require('express');

class RouterHub {

  constructor(dbConnection) {
    this.router = express.Router();
    this.RoutesInitializer = require('./RoutesInitializer');
    this.routeObject = new this.RoutesInitializer(dbConnection)
    this.routeObject.loadRoutes()
        .then((routes) => {
          this.routes = routes
          this.initializeRoutes();
    });
  }

  getRouter() {
    return this.router;
  }

  redirect(req, res, next) {
    if (req.session.hasOwnProperty('authenticated')) {
      if (!req.session.authenticated) {
        res.redirect('/');
        return false;
      }
    } else {
      req.session.authenticated = false;
      res.redirect('/');
      return false;
    }
    next();
  }

  initializeRoutes() {
    this.routes.forEach((route) => {
      route.auth 
      ? this.router[route.method](route.path, this.redirect, route.controller)
      : this.router[route.method](route.path, route.controller);
    });
  }
}

module.exports = RouterHub;
