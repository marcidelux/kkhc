const config = require('../../../server/envConfig');

db.createUser({user:config.MONGO_INITDB_ROOT_USERNAME, pwd:config.MONGO_INITDB_ROOT_PASSWORD, roles: [{ role: "userAdminAnyDatabase", db: "admin" }] });
