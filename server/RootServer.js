'use strict';

const express = require('express');
const RouterHub = require('./routes/RouterHub');
const path = require('path');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const util = require('util');
 
class RootServer {
  
  constructor(port) {
    this.PORT = port;
    this.server;
    this.app;
    this.HOST = '0.0.0.0';
    this.router = new RouterHub();
  }
  
  init() {
    this.app = express();
    this.http = require('http').Server(this.app);
    this.io = require('socket.io')(this.http);
    this.ioHandler = require('./socketIO/ioHandler').handler(this.io);    
    this.app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));        
    this.app.use(morgan('dev'));    
    this.app.use(session({
        store: new MemoryStore({
          checkPeriod: 86400000 // prune expired entries every 24h
        }),
        secret: 'a játék'
    }));

    this.app.use(express.static('assets'));    
    this.app.use('/opt/images/', express.static(path.join(__dirname + '/../images')));
    
    this.app.engine('handlebars', exphbs({
      extname:'handlebars', 
      defaultLayout:'main.handlebars', 
      layoutsDir: 'views/layouts',
    }));    
    this.app.set('view engine', 'handlebars');

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
