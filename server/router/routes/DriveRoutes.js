'use strict';

class DriveRoutes {
  constructor (controller) {
    this.routes = [
      {
        path: '/folder/:folderHash',
        method: 'get',
        controller: controller.folder(),
      },
      {
        path: '/image/:imageHash',
        method: 'get',
        controller: controller.image(),
      },
      {
        path: '/addToCommentFlow/:hashes',
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
    ];
  }

  exportRoutes() {
    return this.routes;
  }

}

module.exports = DriveRoutes;