
const routes = [{
    path: '/ping',
    method: 'get',
    controller: (req, res) => {
        res.status(200);
        res.json({admin_status: 'ok'});
    },
}];

module.exports = routes;
