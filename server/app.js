'use strict';

const config = require('./envConfig');
const RootServer = require('./RootServer');
const connectToDb = require('./database/connectToDb');
const memDB = require('./helpers/InMemoryDB').db;

connectToDb(config).then((connectionEstablished) => {
	const server = new RootServer(config.EXPRESS_PORT, connectionEstablished);
	// console.log('User List\n', memDB.getUsers(), '\n-----------------------------------------\n');
	// memDB.populateUserList(connectionEstablished)
	// .then(msg => {
	// 	console.log('\npopulateMSG\n', msg, '\n-----------------------------------------\n');
	// 	console.log('User List\n', memDB.getUsers(), '\n-----------------------------------------\n');
	// 	console.log('User id by username\n', memDB.usernameToId('miki'), '\n-----------------------------------------\n');		
	// 	console.log('User id by username false name\n', memDB.usernameToId('farok'), '\n-----------------------------------------\n');		
	// 	console.log('Username by id\n', memDB.idToUsername('5b4b4d5eb2d03b00bf3ad947'), '\n-----------------------------------------\n');		
	// 	console.log('Username by id false id\n', memDB.idToUsername('farok'), '\n-----------------------------------------\n');
	// 	console.log('Active users\n', memDB.getActiveUsers(), '\n-----------------------------------------\n');
	// 	console.log('Activating user\n', memDB.activateUser({ id: '5b4b4d5eb2d03b00', username: 'mki', email: 'mikloslorinczi.it@gmail.com' }), '\n-----------------------------------------\n');
	// 	console.log('Active users with one activated\n', memDB.getActiveUsers(), '\n-----------------------------------------\n');
	// 	console.log('Activating user\n', memDB.activateUser({ username: 'Lala' }), '\n-----------------------------------------\n');
	// 	console.log('Active users with two activated\n', memDB.getActiveUsers(), '\n-----------------------------------------\n');
	// 	console.log('Deactivating user\n', memDB.deactivateUser({ username: 'Lala' }), '\n-----------------------------------------\n');
	// 	console.log('Active users with one activated\n', memDB.getActiveUsers(), '\n-----------------------------------------\n');
	// 	console.log('Adding new user Ficó\n', memDB.addNewUser({id: 'asd123', username: 'Ficó', email: 'fico@freemail.hu', enabled: false }), '\n-----------------------------------------\n');
	// 	console.log('User List\n', memDB.getUsers(), '\n-----------------------------------------\n');
	// 	console.log('Get user by id\n', memDB.getUser({ id: '5b4b4d5eb2d03b00bf3ad947' }), '\n-----------------------------------------\n');
	// 	console.log('Get user by false id\n', memDB.getUser({ id: '5b4b4d5eb2db00bf3ad947' }), '\n-----------------------------------------\n');
	// 	console.log('Get user by username\n', memDB.getUser({ username: 'Ficó' }), '\n-----------------------------------------\n');
	// 	console.log('Get user by email\n', memDB.getUser({ email: 'ad@wasd.gov' }), '\n-----------------------------------------\n');
	// 	console.log('Updating user miki\n', memDB.updateUser({ id: '5b4b4d5eb2d03b00bf3ad947', email: 'denemáhova@oda.gov', username: 'Mikulás' }) ,'\n-----------------------------------------\n');
	// 	// console.log('Get user by id\n', memDB.getUser({ id: '5b4b4d5eb2d03b00bf3ad947' }), '\n-----------------------------------------\n');
	// }).catch(msg => {console.log(msg);});
	console.log('Initializing KKHC Server...');
	server.init();	
});
