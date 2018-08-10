const mongoose = require('mongoose');
const RootServer = require('./../server/RootServer');
const request = require('supertest');
const connectToDb = require('./../server/database/connectToDb');
const config = require('./../server/envConfig');
const populate = require('./../server/database/populate');
const traverse = require('./../server/database/traverser');
const mockConfig = Object.assign(config, {
  	DB_ALIAS: 'test_db',
  	MONGO_PORT: '27018',
})

describe('should database seeding work', () => {
	let connection;
	let server;

	let innerDirectory;
	let imageObjectReferenceHash;
	let anotherImageObjectReferenceHash;
	let commentflowId;

	beforeAll(async (done) => {
		connection = await connectToDb(config)
		server = new RootServer(1111, connection);
		server.init();

	  	await populate(traverse('/opt/images'), connection)
		return done()
	});

	afterAll(async (done) => {
		await connection.models.Folder.collection.drop();
		await connection.models.Image.collection.drop();
		await connection.models.CommentFlow.collection.drop();
		await connection.models.Tag.collection.drop();
		await mongoose.connection.close(true)
		server.close();
		return done()
	});

	it('folder endpoint response with proper object', async () => {
		const rootFolder = await connection.models.Folder.find({ hash: 0 }).exec();

		const req = await request(server.app)
            .get('/folder/0')
            .set('Accept', 'application/json')

        const rootResponse = JSON.parse(req.text)

		expect(rootResponse.hash).toEqual(rootFolder[0].hash);

		innerDirectory = rootResponse.contains[0]
	});

	it('inner folder endpoint response with proper object', async () => {
		const innerDirectoryModel = await connection.models.Folder.find({ hash: innerDirectory.hash }).exec();

		const req = await request(server.app)
            .get(`/folder/${innerDirectory.hash}`)
            .set('Accept', 'application/json')

        const innerDirectoryResponse = JSON.parse(req.text)

        expect(innerDirectoryResponse.hash).toEqual(innerDirectoryModel[0].hash);
        expect(JSON.stringify(innerDirectoryResponse.contains)).toEqual(JSON.stringify(innerDirectoryModel[0].contains));
        expect(innerDirectoryResponse.name).toEqual(innerDirectoryModel[0].name);
        expect(innerDirectoryResponse.path).toEqual(innerDirectoryModel[0].path);
        expect(innerDirectoryResponse._id.toString()).toEqual(innerDirectoryModel[0]._id.toString());

        expect(innerDirectoryModel[0].contains[0].commentFlow).toBeFalsy()

		imageObjectReferenceHash = innerDirectoryResponse.contains[0].hash;
		anotherImageObjectReferenceHash = innerDirectoryResponse.contains[1].hash;
	});

	it('image endpoint response with proper object', async () => {
		const imageModel = await connection.models.Image.find({ hash: imageObjectReferenceHash }).exec();

		const req = await request(server.app)
            .get(`/image/${imageObjectReferenceHash}`)
            .set('Accept', 'application/json')

        const imageObjectResponse = JSON.parse(req.text)

        expect(imageObjectResponse.name).toEqual(imageModel[0].name);
        expect(JSON.stringify(imageObjectResponse.tags)).toEqual(JSON.stringify(imageModel[0].tags));
        expect(imageObjectResponse.url).toEqual(imageModel[0].url);
        expect(imageObjectResponse.hash).toEqual(imageModel[0].hash);
        expect(imageObjectResponse.thumb).toEqual(imageModel[0].thumb);
        expect(imageObjectResponse.commentFlow).toEqual(imageModel[0].commentFlow);
        commentflowId = imageObjectResponse.commentFlow
        expect(imageObjectResponse._id.toString()).toEqual(imageModel[0]._id.toString());
	});

	it('addToCommentFlow should find proper image and add comment', async () => {
		const user = 'testUser';
		const text = 'some comment'
		const req = await request(server.app)
            .post(`/addToCommentFlow/${JSON.stringify({
            	imageHash: imageObjectReferenceHash,
            	folderHash: innerDirectory.hash,
            	commentFlowHash: commentflowId,
            })}`)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send({ user, text });

        const { comments } = JSON.parse(req.text);

        const commentFlow = await connection.models.CommentFlow.findById(commentflowId).exec();

        expect(comments[0].text).toEqual(text);
        expect(comments[0].user).toEqual(user);

        expect(comments[0].id.toString()).toEqual(commentFlow.comments[0].id.toString());
        expect(comments[0].text).toEqual(commentFlow.comments[0].text);
        expect(comments[0].user).toEqual(commentFlow.comments[0].user);
        expect(new Date(comments[0].date)).toEqual(commentFlow.comments[0].date);
	});

	it('after comment has been added folder containing image with new comment should been updated', async () => {
		const innerDirectoryModel = await connection.models.Folder.find({ hash: innerDirectory.hash }).exec();
		expect(innerDirectoryModel[0].contains[0].commentFlow.toString()).toEqual(commentflowId.toString())
	});

	describe('tag mechanism', () => {
		const newTagName = 'ppl on the moon';
		const author = 'Oberon';
		const imageUrl = 'opt/use/misc/dunno';
		let insertedTagId;

		it('create should work', async () => {
			const req = await request(server.app)
				.post(`/createTag/${imageObjectReferenceHash}`)
				.set('Accept', 'application/json')
				.set('Content-Type', 'application/json')
				.send({
					'name': newTagName,
					'originalAuthor': author,
					'reference': {
						'url': imageUrl,
					},
				});
	
			const newTag = JSON.parse(req.text);
			expect(newTag.name).toBe(newTagName);
			expect(newTag.originalAuthor).toBe(author);
			expect(Number(newTag.refersTo[0].imageHash)).toBe(imageObjectReferenceHash);
			expect(newTag.refersTo[0].url).toBe(imageUrl);
		});
	
		it('can\'t add same tag twice', async () => {
			const req = await request(server.app)
				.post(`/createTag/${imageObjectReferenceHash}`)
				.set('Accept', 'application/json')
				.set('Content-Type', 'application/json')
				.send({
					'name': newTagName,
					'originalAuthor': author,
					'reference': {
						'url': imageUrl,
					},
				});
			expect(req.status).toBe(304);
		});

		it('imageObject should update with new Tag', async () => {
			const [ imageModel ] = await connection.models.Image.find({ hash: imageObjectReferenceHash }).exec();
			expect(imageModel.tags[0].tagName).toBe(newTagName);
			insertedTagId = imageModel.tags[0].tagId;
		});

		it('can\'t insert same picture to Tag references', async () => {
			const req = await request(server.app)
				.put(`/insertIntoTag/${imageObjectReferenceHash}`)
				.set('Accept', 'application/json')
				.set('Content-Type', 'application/json')
				.send({
					'name': newTagName,
					'reference': {
						'url': imageUrl,
					},
				})
			expect(req.status).toBe(304);
		});

		it('insert another picture to Tag references', async () => {
			const req = await request(server.app)
				.put(`/insertIntoTag/${anotherImageObjectReferenceHash}`)
				.set('Accept', 'application/json')
				.set('Content-Type', 'application/json')
				.send({
					'name': newTagName,
					'reference': {
						'url': `${imageUrl}!`,
					},
				})
			const existingTag = JSON.parse(req.text);
			expect(Number(existingTag.refersTo[0].imageHash)).toBe(imageObjectReferenceHash);
			expect(Number(existingTag.refersTo[1].imageHash)).toBe(anotherImageObjectReferenceHash);
		});

		it('get specific Tag', async () => {
			const req = await request(server.app)
				.get(`/getSpecificTag/${insertedTagId}`)
				.set('Accept', 'application/json')
			
			const tag = JSON.parse(req.text);
			expect(tag._id.toString()).toBe(insertedTagId.toString());
			expect(tag.name).toBe(newTagName);
			expect(tag.originalAuthor).toBe(author);
			expect(Number(tag.refersTo[0].imageHash)).toBe(imageObjectReferenceHash);
			expect(Number(tag.refersTo[1].imageHash)).toBe(anotherImageObjectReferenceHash);
		});

		it('find all tags should work', async () => {
			let i = 0;
			while (i < 10) {
				i += 1;
				const tag = new connection.models.Tag({
					name: i,
					refersTo: [],
					originalAuthor: author,
				});
				await tag.save();
			}
			const req = await request(server.app)
				.get(`/getExistingTags`)
				.set('Accept', 'application/json')
			
			const tags = JSON.parse(req.text);
			expect(tags.length).toBe(11);
		});
	});
});
