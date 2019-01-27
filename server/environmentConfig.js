const currentIp = '192.168.0.16';

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
  WEB_URL: NODE_ENV === 'development'
    ? `http://${currentIp}:3030`
    : 'https://kkhc.eu',
}))(process.env);
