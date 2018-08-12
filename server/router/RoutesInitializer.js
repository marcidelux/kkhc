const fs = require('fs');
const _ = require('lodash');

class RoutesInitializer {
  constructor(dbConnection) {
    this.routes = [];
    this.dbConnection = dbConnection;
  }

  loadRoutes() {
    return new Promise(resolve => fs.readdir(`${__dirname}/controllers`, (error, files) => {
      files.forEach((fileName) => {
        const [nameSpace] = _.upperFirst(
          _.kebabCase(fileName.split('.')[0]),
        ).split('-');

        /* eslint-disable global-require, import/no-dynamic-require */
        const ConstructorController = require(`./controllers/${nameSpace}Controller`);
        const ConstructorRoutes = require(`./routes/${nameSpace}Routes`);
        /* eslint-enable global-require, import/no-dynamic-require */

        this[nameSpace] = new ConstructorRoutes(
          new ConstructorController(this.dbConnection),
        );
        this.routes.push(...this[nameSpace].routes);
        resolve(this.routes);
      });
    }));
  }
}

module.exports = RoutesInitializer;
