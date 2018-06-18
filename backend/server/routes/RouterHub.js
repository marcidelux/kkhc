'use strict';

const cors = require('cors');
const express = require('express');
const routes = require('./basic/endpoints');
const adminRoutes = require('./admin/endpoints');
const util = require('util');

function check(req, res, next) {
  console.log(1234)
  next()
}

function redirector(req, res, next) {
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

class RouterHub {    

  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  getRouter() {
    return this.router;
  }

  initializeRoutes() {
    this.router.use(cors());
    this.router.use(express.json());
    // this.router.use(redirector);
    routes.forEach((route) => {
      route.auth 
      ? this.router[route.method](route.path, redirector, route.controller)
      : this.router[route.method](route.path, route.controller);
    });
  }
}

module.exports = RouterHub;
