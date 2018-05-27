const BasicController = require('./BasicController');

const controller = new BasicController();

const routes = [
     {
        path: '/_dummy',
        method: 'get',
        controller: controller._dummyGet(),
    },
];

module.exports = routes;
