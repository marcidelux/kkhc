'use strict';

const BasicController = require('./BasicController');

const controller = new BasicController();

const routes = [
  {
    path: '/_dummy',
    method: 'get',
    controller: controller._dummyGet(),
  },
  {
    path: '/',
    method: 'get',
    controller: controller.home(),
  },
  {
    path: '/ribbit',
    method: 'get',
    controller: controller.ribbit(),
  },
];

module.exports = routes;
