class DriveRoutes {
  constructor(controller) {
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
        path: '/addToCommentFlow/:imageHash',
        method: 'post',
        controller: controller.addToCommentFlow(),
      },
      {
        path: '/getCommentFlow/:imageHash',
        method: 'get',
        controller: controller.getCommentFlow(),
      },
      {
        path: '/createTag/:imageHash',
        method: 'post',
        controller: controller.createTag(),
      },
      {
        path: '/insertIntoTag/:imageHash',
        method: 'put',
        controller: controller.insertIntoTag(),
      },
      {
        path: '/getSpecificTag/:tagId',
        method: 'get',
        controller: controller.getSpecificTag(),
      },
      {
        path: '/getExistingTags',
        method: 'get',
        controller: controller.getExistingTags(),
      },
    ];
  }
}

module.exports = DriveRoutes;
