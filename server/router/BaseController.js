class BaseController {
	constructor(dbConnection) {
	    this.connection = dbConnection
    	this.models = this.connection.models;
	}
}

module.exports = BaseController;
