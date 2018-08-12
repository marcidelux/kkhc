class AdminRoutes {
  constructor(controller) {
    this.routes = [
      {
        path: '/admin',
        method: 'post',
        controller: controller.admin(),
        auth: false,
      },
    ];
  }
}

module.exports = AdminRoutes;
