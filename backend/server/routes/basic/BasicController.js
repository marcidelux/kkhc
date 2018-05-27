
class BasicController {

    constructor() {}

    _dummyGet() {
        return (req, res) => {
            console.log(req.query)
            console.log(req.body);
            res.status(200);
            res.json({status: 'ok'});
        };
    }
}

module.exports = BasicController;
