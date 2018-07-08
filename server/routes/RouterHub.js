'use strict';

const cors = require('cors');
const express = require('express');

class RouterHub {

  constructor(dbConnection) {
    this.router = express.Router();
    this.RoutesInitializer = require('./endpoints');
    this.routeObject = new this.RoutesInitializer(dbConnection);
    this.routes = this.routeObject.routes
    this.initializeRoutes();
  }

  getRouter() {
    return this.router;
  }

  redirect(req, res, next) {
    console.log(req.session);
  if (req.session.hasOwnProperty('authenticated')) {
    console.log('not the First visit');
    if (req.session.authenticated) {
      console.log('Authenticated');
    } else {
      console.log('NOT Authenticated');
      console.log('REDIRECTING');
      res.redirect('/');
      return false;
    }
  } else {
    req.session.authenticated = false;
    console.log('First visit');
    console.log('NOT Authenticated');
    console.log('REDIRECTING');
    res.redirect('/');
    return false;
  }
  next();
  }

  initializeRoutes() {
    this.router.use(cors());
    this.router.use(express.json());
    this.routes.forEach((route) => {
      route.auth 
      ? this.router[route.method](route.path, this.redirect, route.controller)
      : this.router[route.method](route.path, route.controller);
    });
  }
}

module.exports = RouterHub;
