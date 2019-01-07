module.exports = (({
  NODE_ENV = 'development',
  EXPRESS_PORT = 3000,
  DB_ALIAS = 'db',
  ...REST
}) => ({
  ...REST,
  NODE_ENV,
  EXPRESS_PORT,
  DB_ALIAS,
}))(process.env);
