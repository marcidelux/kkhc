'use strict';

const conf = require('../../../server/envConfig');

db.createUser({user:conf.MONGO_INITDB_ROOT_USERNAME, pwd:conf.MONGO_INITDB_ROOT_PASSWORD, roles: [{ role: "userAdminAnyDatabase", db: "admin" }] });
