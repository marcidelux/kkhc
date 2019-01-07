const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const { createServer } = require('http');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const { ApolloServer } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { makeExecutableSchema } = require('graphql-tools');

const {
  PATH_TO_DRIVE,
  PATH_TO_AVATARS,
  GRAPHQL_ENDPOINT,
  GRAPHQL_SUBSCRIPTIONS,
} = require('./constants');
const config = require('./environmentConfig');
const RouterHub = require('./router/RouterHub');

const schema = makeExecutableSchema({
  typeDefs: [fs.readFileSync('/opt/server/typeDefs.graphql', 'utf-8')],
  // eslint-disable-next-line
  resolvers: require('/opt/server/resolvers'),
});

class RootServer {
  constructor(port, dbConnection) {
    this.PORT = port;
    this.db = dbConnection;
    this.router = new RouterHub(dbConnection);
  }

  init() {
    this.app = express();
    this.http = createServer(this.app);

    this.app.use(helmet());
    this.app.use(cookieParser());
    this.app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : ''));
    this.app.use(cors({
      credentials: true,
      origin: config.NODE_ENV === 'development'
        ? 'http://localhost:3030'
        : 'https://kkhc.eu',
    }));
    this.app.use(express.json());
    this.app.use(fileUpload());

    this.app.use(
      PATH_TO_DRIVE,
      express.static(path.join(`${__dirname}/../files`), { maxAge: '6h' }),
    );
    this.app.use(
      PATH_TO_AVATARS,
      express.static('./avatars', { maxAge: '6h' }),
    );

    this.app.use('/', this.router.getRouter());

    const apollo = new ApolloServer({
      schema,
      subscriptions: {
        // @todo check if this declaration is needed ?
        path: GRAPHQL_SUBSCRIPTIONS,
      },
      context: ({ req, res, connection }) => ({
        db: this.db,
      }),
      playground: {
        settings: {
          'editor.theme': 'light',
          'editor.cursorShape': 'line',
        },
      },
    });

    this.app.use(async (req, res, next) => {
      try {
        await jwt.verify(req.cookies.token, config.EXPRESS_SECRET);
        next();
      } catch (error) {
        console.log(error);
      }
    });

    apollo.applyMiddleware({
      app: this.app,
      path: GRAPHQL_ENDPOINT,
      cors: {
        credentials: true,
        origin: config.NODE_ENV === 'development'
          ? 'http://localhost:3030'
          : 'https://kkhc.eu',
      },
    });

    this.server = this.http.listen(this.PORT, () => {
      console.log(`KKHC Server running in ${config.NODE_ENV} mode, listening on PORT ${this.PORT}`);
      // eslint-disable-next-line
      new SubscriptionServer({
        execute,
        subscribe,
        schema,
        onConnect: async (connectionParams, webSocket, context) => {
          if (connectionParams.token) {
            try {
              await jwt.verify(connectionParams.token, config.EXPRESS_SECRET);
              return true;
            } catch (error) {
              console.log(error);
            }
          }
          return false;
        },
        onDisconnect: (webSocket, context) => {
          // console.log('disconnect', webSocket, context);
        },
      }, {
        server: this.http,
        path: GRAPHQL_SUBSCRIPTIONS,
      });
    });
  }

  close() {
    this.server.close();
  }
}

module.exports = RootServer;
