'use strict';

const NODE_ENV =  process.env.NODE_ENV || 'development';

const EXPRESS_PORT = process.env.EXPRESS_PORT || 3000;

const WEB_URL = (NODE_ENV == 'development') ? `http://localhost:${EXPRESS_PORT}` : 'kkhc.eu'

module.exports = {
  MONGO_DATA_DIR: process.env.MONGO_DATA_DIR, 
  MONGO_LOG_DIR: process.env.MONGO_LOG_DIR,
  MONGO_INITDB_ROOT_USERNAME: process.env.MONGO_INITDB_ROOT_USERNAME,  
  MONGO_INITDB_ROOT_PASSWORD: process.env.MONGO_INITDB_ROOT_PASSWORD,
  MONGO_INITDB_DATABASE: process.env.MONGO_INITDB_DATABASE,
  DB_ALIAS: 'db',
  DB_PORT: '27017',
  EXPRESS_PORT,
  NODE_ENV,
  WEB_URL,
}
