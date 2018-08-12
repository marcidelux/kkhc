class UserRoutes {
  constructor(controller) {
    this.routes = [
      {
        path: '/forgotPassword',
        method: 'put',
        controller: controller.forgotPassword(),
      },
      {
        path: '/resetPassword',
        method: 'put',
        controller: controller.resetPassword(),
      },
    ];
  }
}

module.exports = UserRoutes;
