'use strict';

const BasicController = require('./controllers');

class RoutesInitializer {

  constructor(dbConnection) {
    this.controller = new BasicController(dbConnection);
    this.routes = [
    {
      path: '/',
      method: 'get',
      controller: this.controller.login(),
    },
    {
      path: '/auth',
      method: 'post',
      controller: this.controller.auth(),
    },
    {
      path: '/ribbit',
      method: 'get',
      controller: this.controller.ribbit(),
      auth: true,
    },
    {
      path: '/folder/:folderHash',
      method: 'get',
      controller: this.controller.folder(),
    },
    {
      path: '/addFirstCommentToPicture/:folderHash',
      method: 'post',
      controller: this.controller.addFirstCommentToPicture(),
    },
    {
      path: '/addToCommentFlow/:commentFlowId',
      method: 'post',
      controller: this.controller.addToCommentFlow(),
    },
    {
      path: '/getCommentFlow/:commentFlowId',
      method: 'get',
      controller: this.controller.getCommentFlow(),
    },
    {
      path: '/createTag/:folderHash',
      method: 'post',
      controller: this.controller.createTag(),
    },
    {
      path: '/insertIntoTag/:folderHash',
      method: 'post',
      controller: this.controller.insertIntoTag(),
    },
    {
      path: '/addUser',
      method: 'get',
      controller: this.controller.addUser(),
      auth: false,
    },
    {
      path: '/_dummy',
      method: 'get',
      controller: this.controller._dummyGet(),
      auth: false,
    }];
  }
}

module.exports = RoutesInitializer;
