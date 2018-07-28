"use strict";

const fs = require("fs");
const _ = require("lodash");

class RoutesInitializer {
  constructor(dbConnection) {
    this.routes = [];
    this.dbConnection = dbConnection;
  }

  loadRoutes() {
    return new Promise((resolve, reject) => {
      return fs.readdir(`${__dirname}/controllers`, (error, files) => {
        files.forEach(fileName => {
          const [nameSpace] = _.upperFirst(
            _.kebabCase(fileName.split(".")[0])
          ).split("-");

          const constructorController = require(`./controllers/${nameSpace}Controller`);
          const constructorRoutes = require(`./routes/${nameSpace}Routes`);

          this[nameSpace] = new constructorRoutes(
            new constructorController(this.dbConnection)
          );
          this.routes.push(...this[nameSpace].routes);
          resolve(this.routes);
        });
      });
    });
  }
}

module.exports = RoutesInitializer;
