const mongoose = require('mongoose');
const request = require('supertest');
const RootServer = require('./../server/RootServer');
const connectToDb = require('./../server/database/connectToDb');
const config = require('../server/environmentConfig');
const populate = require('./../server/database/populate');
const traverse = require('./../server/database/traverser');

Object.assign(config, {
  DB_ALIAS: 'test_db',
  MONGO_PORT: '27018',
});

describe('should database seeding work', () => {
  const folderQuery = `
  query getFolderContent($hash: Int!) {
    getFolderContent(hash: $hash) {
      name,
      path,
      hash,
      type,
      contains {
        ... on Folder {
            name,
            path,
            hash,
            type,
        }
        ... on Image {
          name,
          path,
          type,
          hash,
          parentHash,
          extension,
        }
      }
    }
  }`;

  const imageQuery = `
  query getImage($hash: Int!) {
    getImage(hash: $hash) {
      name,
      path,
      hash,
      parentHash,
      type,
      extension,
    }
  }`;

  const commentFlowQuery = `
  mutation addToCommentFlow($imageHash: Int!, $comment: CommentInput!) {
    addToCommentFlow(imageHash: $imageHash, comment: $comment) {
      comments {
        id,
        date,
        text,
        userId,
      }
      belongsTo
    }
  }`;

  let connection;
  let server;

  let innerDirectory;
  let imageObjectReferenceHash;
  let anotherImageObjectReferenceHash;

  beforeAll(async (done) => {
    // @todo have a proper setup
    connection = await connectToDb(config);
    server = new RootServer(1111, connection);
    server.init();

    await populate(traverse(config.PATH_TO_DRIVE), connection);
    return done();
  });

  afterAll(async (done) => {
    // @todo have a proper teardown
    await connection.models.Folder.collection.drop();
    await connection.models.Image.collection.drop();
    await connection.models.CommentFlow.collection.drop();
    await connection.models.Tag.collection.drop();
    await mongoose.connection.close(true);
    server.close();
    return done();
  });

  it('getFolderContent - rootFolder query', async () => {
    const rootFolder = await connection.models.Folder
      .findOne({ hash: 0 }).exec();

    const req = await request(server.app)
      .post('/mobile')
      .send({
        query: folderQuery,
        variables: { hash: 0 },
      })
      .set('Accept', 'application/json');
    const { data: { getFolderContent } } = JSON.parse(req.text);

    expect(getFolderContent.hash).toEqual(rootFolder.hash);
    expect(getFolderContent.name).toEqual('kkhc');

    [innerDirectory] = getFolderContent.contains;
  });

  it('getFolderContent - innerfolder query', async () => {
    const innerDirectoryfromDb = await connection.models.Folder
      .findOne({ hash: innerDirectory.hash }).exec();

    const req = await request(server.app)
      .post('/mobile')
      .send({
        query: folderQuery,
        variables: { hash: innerDirectory.hash },
      })
      .set('Accept', 'application/json');

    const { data: { getFolderContent } } = JSON.parse(req.text);

    Object.keys(getFolderContent)
      .forEach(property => (
        Array.isArray(getFolderContent[property])
          ? expect(JSON.stringify(getFolderContent[property]))
            .toEqual(JSON.stringify(innerDirectoryfromDb[property]))
          : expect(getFolderContent[property])
            .toEqual(innerDirectoryfromDb[property])
      ));

    ({
      contains: [{
        hash: imageObjectReferenceHash,
      }, {
        hash: anotherImageObjectReferenceHash,
      }],
    } = getFolderContent);
  });

  it('getImage - imageObject have all properties associated with it', async () => {
    const imageFromDb = await connection.models.Image
      .findOne({ hash: imageObjectReferenceHash }).exec();

    const req = await request(server.app)
      .post('/mobile')
      .send({
        query: imageQuery,
        variables: { hash: imageObjectReferenceHash },
      })
      .set('Accept', 'application/json');

    const { data: { getImage } } = JSON.parse(req.text);

    Object.keys(getImage)
      .forEach(property => expect(getImage[property]).toEqual(imageFromDb[property]));
  });

  it('addToCommentFlow should find proper image and add comment', async () => {
    const userId = '1ab2c3';
    const text = 'some comment';
    const req = await request(server.app)
      .post('/mobile')
      .set('Accept', 'application/json')
      .send({
        query: commentFlowQuery,
        variables: { imageHash: imageObjectReferenceHash, comment: { userId, text } },
      });

    const { data: { addToCommentFlow: { comments: [commentFromResponse] } } } = JSON.parse(req.text);

    const { comments: [commentFromDb] } = await connection.models.CommentFlow
      .findOne({ belongsTo: imageObjectReferenceHash }).exec();

    expect(commentFromResponse.text).toEqual(text);
    expect(commentFromResponse.userId).toEqual(userId);

    Object.keys(commentFromDb)
      .forEach(property => expect(commentFromResponse[property]).toEqual(commentFromDb[property]));
  });

  // describe('tag mechanism', () => {
  //   const newTagName = 'ppl on the moon';
  //   const author = 'Oberon';
  //   const imageUrl = 'opt/use/misc/dunno';
  //   let insertedTagId;

  //   it('create should work', async () => {
  //     const req = await request(server.app)
  //       .post(`/createTag/${imageObjectReferenceHash}`)
  //       .set('Accept', 'application/json')
  //       .set('Content-Type', 'application/json')
  //       .send({
  //         name: newTagName,
  //         originalAuthor: author,
  //         reference: {
  //           url: imageUrl,
  //         },
  //       });

  //     const newTag = JSON.parse(req.text);
  //     expect(newTag.name).toBe(newTagName);
  //     expect(newTag.originalAuthor).toBe(author);
  //     expect(Number(newTag.refersTo[0].imageHash)).toBe(
  //       imageObjectReferenceHash,
  //     );
  //     expect(newTag.refersTo[0].url).toBe(imageUrl);
  //   });

  //   it('can\'t add same tag twice', async () => {
  //     const req = await request(server.app)
  //       .post(`/createTag/${imageObjectReferenceHash}`)
  //       .set('Accept', 'application/json')
  //       .set('Content-Type', 'application/json')
  //       .send({
  //         name: newTagName,
  //         originalAuthor: author,
  //         reference: {
  //           url: imageUrl,
  //         },
  //       });
  //     expect(req.status).toBe(304);
  //   });

  //   it('imageObject should update with new Tag', async () => {
  //     const [imageModel] = await connection.models.Image.find({
  //       hash: imageObjectReferenceHash,
  //     }).exec();
  //     expect(imageModel.tags[0].tagName).toBe(newTagName);
  //     insertedTagId = imageModel.tags[0].tagId;
  //   });

  //   it('can\'t insert same picture to Tag references', async () => {
  //     const req = await request(server.app)
  //       .put(`/insertIntoTag/${imageObjectReferenceHash}`)
  //       .set('Accept', 'application/json')
  //       .set('Content-Type', 'application/json')
  //       .send({
  //         name: newTagName,
  //         reference: {
  //           url: imageUrl,
  //         },
  //       });
  //     expect(req.status).toBe(304);
  //   });

  //   it('insert another picture to Tag references', async () => {
  //     const req = await request(server.app)
  //       .put(`/insertIntoTag/${anotherImageObjectReferenceHash}`)
  //       .set('Accept', 'application/json')
  //       .set('Content-Type', 'application/json')
  //       .send({
  //         name: newTagName,
  //         reference: {
  //           url: `${imageUrl}!`,
  //         },
  //       });
  //     const existingTag = JSON.parse(req.text);
  //     expect(Number(existingTag.refersTo[0].imageHash)).toBe(
  //       imageObjectReferenceHash,
  //     );
  //     expect(Number(existingTag.refersTo[1].imageHash)).toBe(
  //       anotherImageObjectReferenceHash,
  //     );
  //   });

  //   it('get specific Tag', async () => {
  //     const req = await request(server.app)
  //       .get(`/getSpecificTag/${insertedTagId}`)
  //       .set('Accept', 'application/json');

  //     const tag = JSON.parse(req.text);
  //     expect(tag._id.toString()).toBe(insertedTagId.toString());
  //     expect(tag.name).toBe(newTagName);
  //     expect(tag.originalAuthor).toBe(author);
  //     expect(Number(tag.refersTo[0].imageHash)).toBe(imageObjectReferenceHash);
  //     expect(Number(tag.refersTo[1].imageHash)).toBe(
  //       anotherImageObjectReferenceHash,
  //     );
  //   });

  //   it('find all tags should work', async () => {
  //     let i = 0;
  //     const tagArray = [];
  //     while (i < 10) {
  //       i += 1;
  //       const tag = new connection.models.Tag({
  //         name: i,
  //         refersTo: [],
  //         originalAuthor: author,
  //       });
  //       tagArray.push(tag.save());
  //     }

  //     await Promise.all(tagArray);
  //     const req = await request(server.app)
  //       .get('/getExistingTags')
  //       .set('Accept', 'application/json');

  //     const tags = JSON.parse(req.text);
  //     expect(tags.length).toBe(11);
  //   });
  // });
});
