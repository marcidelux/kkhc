const mongoose = require('mongoose');
const RootServer = require('./../server/RootServer');
const request = require('supertest');
const connectToDb = require('./../server/database/folderModel.js');
const config = require('./../server/envConfig');
const populate = require('./../server/database/populate');
const traverse = require('./../server/database/traverser');
const mockConfig = Object.assign(config, {
  	DB_ALIAS: 'test_db',
  	DB_PORT: '27018',
})
console.log(mockConfig)

describe('should init', () => {
	let connection;
	let server;

	beforeAll(async (done) => {
		connection = await connectToDb(config)
		server = new RootServer(1111, connection);
		server.init();

	  	await populate(traverse('/opt/images'), connection)
		return done()
	})

	afterAll(async (done) => {
		await mongoose.connection.dropDatabase()
		await mongoose.connection.close(true)
		server.close();
		return done()
	})

	it('to be true', async () => {
		const rootFolder = await connection.models.Folder.find({ hash: 0 }).exec();


		const req = await request(server.app)
            .get('/folder/0')
            .set('Accept', 'application/json')

		expect(JSON.parse(req.text).hash).toEqual(rootFolder[0].hash);
	})

});

