'use strict';

const BasicController = require('./BasicController');

const controller = new BasicController();

const routes = [
  {
    path: '/_dummy',
    method: 'get',
    controller: controller._dummyGet(),
    auth: true,
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
    auth: true,
  },
  {
    path: '/addUser',
    method: 'get',
    controller: controller.addUser(),
    auth: false,
  },
];

module.exports = routes;
