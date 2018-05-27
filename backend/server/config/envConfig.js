process.env.NODE_CONFIG_DIR = __dirname;

const config = require('config');
const assert = require('assert-plus');
const fs = require('fs');

// check if config files are available
assert.equal(true, Object.keys(config).length > 0, 'Config file can not be located. Please check if environment variable NODE_CONFIG_DIR is correctly set.');

module.exports = config;

if (process.env.NODE_ENV !== 'test' && process.env.PM2_HOME) {
    fs.writeFileSync(`${process.env.PM2_HOME}/logs/${process.env.NODE_ENV}-${process.env.NODE_APP_INSTANCE}-config.txt`, JSON.stringify(config));
}

if (process.argv.includes('printconfig')) {
    console.log(JSON.stringify(config));
}
