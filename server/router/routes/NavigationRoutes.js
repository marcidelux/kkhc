'use strict';

class NavigationRoutes {
  constructor (controller) {
    this.routes = [
      {
        path: '/auth',
        method: 'post',
        controller: controller.auth(),
      }, 
      {
        path: '/logout',
        method: 'post',
        controller: controller.logout(),
      }, 
      {
        path: '/identify',
        method: 'post',
        controller: controller.identify(),
      }, 
      {
        path: '/',
        method: 'get',
        controller: controller.root(),
      },
      {
        path: '/home',
        method: 'get',
        controller: controller.home(),
        auth: true,
      },
      {
        path: '/ribbit',
        method: 'get',
        controller: controller.ribbit(),
        auth: true,
      },
      {
        path: '/drive',
        method: 'get',
        controller: controller.drive(),
        auth: true,
      },
      {
        path: '/games',
        method: 'get',
        controller: controller.games(),
        auth: true,
      },
      {
        path: '/options',
        method: 'get',
        controller: controller.options(),
        auth: true,
      },
    ];
  }

  exportRoutes() {
    return this.routes;
  }

}

module.exports = NavigationRoutes;