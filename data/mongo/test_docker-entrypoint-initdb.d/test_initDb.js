// const conf = require('../../../server/envConfig');

db.createUser({user: "test_super", pwd: "stub", roles: [{ role: "userAdminAnyDatabase", db: "admin" }] });
