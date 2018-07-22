'use strict';

const NavigationController = require('./controllers/NavigationController');
const AdminController = require('./controllers/AdminController');
const DriveController = require('./controllers/DriveController');

const NavigationRoutes = require('./routes/NavigationRoutes');
const AdminRoutes = require('./routes/AdminRoutes');
const DriveRoutes = require('./routes/DriveRoutes');

class RoutesInitializer {

  constructor(dbConnection) {
    this.adminRoutes = new AdminRoutes(new AdminController(dbConnection))
    this.navigationRoutes = new NavigationRoutes(new NavigationController(dbConnection))
    this.driveRoutes = new DriveRoutes(new DriveController(dbConnection))

    this.routes = [
      ...this.navigationRoutes.exportRoutes(),
      ...this.adminRoutes.exportRoutes(),
      ...this.driveRoutes.exportRoutes(),
    ];
  }
}

module.exports = RoutesInitializer;
