// eslint-disable-next-line
db.createUser({
  user: 'test_super',
  pwd: 'stub',
  roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }],
});
