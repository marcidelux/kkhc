const cors = require('cors');
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const config = require('./envConfig');
const RouterHub = require('./router/RouterHub');

const hbs = exphbs.create({
  extname: 'handlebars',
  defaultLayout: 'main.handlebars',
  layoutsDir: './../www/views/layouts',
  helpers: {
    WEB_URL: () => config.WEB_URL,
  },
});

class RootServer {
  constructor(port, dbConnection) {
    this.PORT = port;
    this.HOST = '0.0.0.0';
    this.router = new RouterHub(dbConnection);
  }

  init() {
    this.app = express();

    /* eslint-disable global-require */
    this.http = require('http').Server(this.app);
    this.io = require('socket.io')(this.http);
    this.ioHandler = require('./socketIO/ioHandler').handler(this.io);
    /* eslint-enable global-require */

    this.app.use(favicon(path.join(__dirname, '../www/assets', 'favicon.ico')));
    this.app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : ''));
    this.app.use(
      session({
        name: 'KKHC_Kuk',
        store: new MemoryStore({
          checkPeriod: 86400000,
        }),
        secret: config.EXPRESS_SECRET,
      }),
    );
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('../www/assets'));
    this.app.use(
      '/opt/images/',
      express.static(path.join(`${__dirname}/../images`)),
    );
    this.app.engine('handlebars', hbs.engine);
    this.app.set('view engine', 'handlebars');
    this.app.set('views', `${__dirname}/../www/views`);
    this.app.use('/', this.router.getRouter());
    this.server = this.http.listen(this.PORT, () => {
      console.log(`KKHC Server running on http://${this.HOST}:${this.PORT}`);
    });
  }

  close() {
    this.server.close();
  }
}

module.exports = RootServer;
