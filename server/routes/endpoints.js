'use strict';

const BasicController = require('./controllers');

class RoutesInitializer {

  constructor(dbConnection) {
    this.controller = new BasicController(dbConnection);
    this.routes = [
    {
      path: '/',
      method: 'get',
      controller: this.controller.root(),
    },
    {
      path: '/auth',
      method: 'post',
      controller: this.controller.auth(),
    },
    {
      path: '/home',
      method: 'get',
      controller: this.controller.home(),
      auth: true,
    },
    {
      path: '/ribbit',
      method: 'get',
      controller: this.controller.ribbit(),
      auth: true,
    },
    {
      path: '/drive',
      method: 'get',
      controller: this.controller.drive(),
      auth: true,
    },
    {
      path: '/games',
      method: 'get',
      controller: this.controller.games(),
      auth: true,
    },
    {
      path: '/options',
      method: 'get',
      controller: this.controller.options(),
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
      path: '/admin',
      method: 'post',
      controller: this.controller.admin(),
      auth: false,
    }];
  }
}

module.exports = RoutesInitializer;
