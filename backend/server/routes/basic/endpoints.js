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
    controller: controller.login(),
  },
  {
    path: '/auth',
    method: 'post',
    controller: controller.auth(),
  },
  {
    path: '/ribbit',
    method: 'get',
    controller: controller.ribbit(),
  },
  {
    path: '/addUser',
    method: 'get',
    controller: controller.addUser(),
  },
];

module.exports = routes;
