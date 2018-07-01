'use strict';

const BasicController = require('./controllers');

const controller = new BasicController();

const routes = [
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
    path: '/folder/:folderHash',
    method: 'get',
    controller: controller.folder(),
  },
  {
    path: '/addFirstCommentToPicture/:folderHash',
    method: 'post',
    controller: controller.addFirstCommentToPicture(),
  },
  {
    path: '/addToCommentFlow/:commentFlowId',
    method: 'post',
    controller: controller.addToCommentFlow(),
  },
  {
    path: '/getCommentFlow/:commentFlowId',
    method: 'get',
    controller: controller.getCommentFlow(),
  },
  {
    path: '/createTag/:folderHash',
    method: 'post',
    controller: controller.createTag(),
  },
  {
    path: '/insertIntoTag/:folderHash',
    method: 'post',
    controller: controller.insertIntoTag(),
  },
  {
    path: '/addUser',
    method: 'get',
    controller: controller.addUser(),
    auth: false,
  },
  {
    path: '/_dummy',
    method: 'get',
    controller: controller._dummyGet(),
    auth: false,
  },
];

module.exports = routes;
