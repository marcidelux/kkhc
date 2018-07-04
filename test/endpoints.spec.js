const RootServer = require('./../server/RootServer');
const config = require('./../server/envConfig');
const request = require('supertest');
const {
  connection,
  User,
  Folder,
  CommentFlow,
  Tag,
  findCommentFlowById,
  findFolderByHash,
  findUserByEmail,
  findTagByName,
} = require('./../server/database/folderModel.js');

describe('should init', async () => {
	const server = new RootServer(1111);
	server.init();


	afterAll(async () => {

		await Promise.all([
			Folder.remove().exec(),
			CommentFlow.remove().exec(),
			Tag.remove().exec(),
		])
		connection.close().then(() => server.close());
				console.log('teardown')
	})



	it('to be true', async () => {
		expect(await Folder.find({})).toBe({});
	})

});

