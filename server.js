'use strict';

const path = require('path');
const express = require('express');
const app = express();
const PORT = (process.argv[2] || 1313);
const logger = require('endpointz').reqLog;
const serverLog = require('endpointz').serverLog;
const startMessage = require('endpointz').startMessage;
const handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
const favicon = require('serve-favicon');

app.use(logger);

app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));

app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/about', function(req, res) {
  res.render('about');
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
  res.status(404).render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
  serverLog(err.stack);
  res.status(500).render('500');
});

app.listen(PORT, startMessage('KKHC', PORT));
