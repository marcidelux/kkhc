const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const session = require('express-session');
const { createServer } = require('http');
const MemoryStore = require('memorystore')(session);
const fileUpload = require("express-fileupload");

const { ApolloServer } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { makeExecutableSchema } = require('graphql-tools');

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

const schema = makeExecutableSchema({
  typeDefs: fs.readFileSync('/opt/server/typeDefs.graphql', 'utf-8'),
  // eslint-disable-next-line
  resolvers: require('/opt/server/resolvers'),
});

class RootServer {
  constructor(port, dbConnection) {
    this.PORT = port;
    this.HOST = '0.0.0.0';
    this.db = dbConnection;
    this.router = new RouterHub(dbConnection);
  }

  init() {
    this.app = express();

    /* eslint-disable global-require */
    this.http = createServer(this.app);
    this.io = require('socket.io')(this.http);
    this.ioHandler = require('./socketIO/ioHandler').handler(this.io);
    /* eslint-enable global-require */

    this.app.use(favicon(path.join(__dirname, '../www/assets', 'favicon.ico')));
    this.app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : ''));
    this.app.use(
      session({
        name: 'KKHC_Sessions',
        store: new MemoryStore({
          checkPeriod: 86400000,
        }),
        secret: config.EXPRESS_SECRET,
      }),
    );
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(fileUpload())
    this.app.use(express.static('../www/assets'));
    this.app.use(
      '/opt/images/',
      express.static(path.join(`${__dirname}/../images`)),
    );
    this.app.use(
      config.PATH_TO_AVATARS,
      express.static('./avatars'),
    );
    this.app.engine('handlebars', hbs.engine);
    this.app.set('view engine', 'handlebars');
    this.app.set('views', `${__dirname}/../www/views`);
    this.app.use('/', this.router.getRouter());

    const apollo = new ApolloServer({
      schema,
      subscriptions: {
        path: '/subscriptions',
      },
      context: ({ req }) => ({
        db: this.db,
      }),
      playground: {
        settings: {
          'editor.theme': 'light',
          'editor.cursorShape': 'line',
        },
      },
    });

    apollo.applyMiddleware({ app: this.app, path: '/mobile' });
    // apollo.installSubscriptionHandlers(this.app);

    this.server = this.http.listen(this.PORT, () => {
      console.log('....running   =', apollo.subscriptionsPath);
      // eslint-disable-next-line
      new SubscriptionServer({
        execute,
        subscribe,
        schema,
        onConnect: (connectionParams, webSocket, context) => {
          console.log('connect');
        },
        onDisconnect: (webSocket, context) => {
          console.log('disconnect');
        },
      }, {
        server: this.http,
        path: '/subscriptions',
      });
    });
  }

  close() {
    this.server.close();
  }
}

module.exports = RootServer;
