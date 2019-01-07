class AdminRoutes {
  constructor(controller) {
    this.routes = [
      {
        path: '/admin',
        method: 'post',
        controller: controller.admin(),
      },
    ];
  }
}

module.exports = AdminRoutes;
