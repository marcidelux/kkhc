const mongoose = require('mongoose');
const request = require('supertest');

const fetch = require('node-fetch');
const { ApolloClient } = require('apollo-client');
const { WebSocketLink } = require('apollo-link-ws');
const { split } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');
const { getMainDefinition } = require('apollo-utilities');
const { InMemoryCache } = require('apollo-cache-inmemory');
const gql = require('graphql-tag');

const RootServer = require('./../../server/RootServer');
const connectToDb = require('./../../server/database/connectToDb');
const config = require('./../../server/environmentConfig');
const populate = require('./../../server/database/populate');
const traverse = require('./../../server/database/traverser');
const {
  DRIVE_FILE_TYPES: {
    IMAGE,
  },
} = require('./../../server/constants');

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

  const updateCommentFlowMutation = `
  mutation updateCommentFlow($fileHash: Int!, $comment: CommentInput!) {
    updateCommentFlow(fileHash: $fileHash, comment: $comment) {
      comments {
        id,
        date,
        text,
        userId,
      }
      belongsTo
    }
  }`;

  const updateTagFlowMutation = `
    mutation updateTagFlow($fileLookup: FileLookupInput, $name: String!, $userId: String!) {
      updateTagFlow(fileLookup: $fileLookup, name: $name, userId: $userId) {
        tagPrimitives {
          name,
          userId,
        }
        belongsTo
      }
    }`;

  let connection;
  let server;

  let innerDirectory;
  let imageObjectReferenceHash;

  beforeAll(async (done) => {
    // @todo have a proper setup
    connection = await connectToDb(config);
    server = new RootServer(config.EXPRESS_PORT, connection);
    server.init();

    await populate(traverse(config.PATH_TO_DRIVE), connection);
    return done();
  });

  afterAll(async (done) => {
    // @todo have a proper teardown
    await connection.models.Folder.collection.drop();
    await connection.models.Image.collection.drop();
    await connection.models.CommentFlow.collection.drop();
    await connection.models.TagFlow.collection.drop();
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
      .set('Accept', 'application/json')
      .send({
        query: folderQuery,
        variables: { hash: 0 },
      });

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
      .set('Accept', 'application/json')
      .send({
        query: folderQuery,
        variables: { hash: innerDirectory.hash },
      });

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
      contains: [
        { hash: imageObjectReferenceHash },
      ],
    } = getFolderContent);
  });

  it('getImage - imageObject have all properties associated with it', async () => {
    const imageFromDb = await connection.models.Image
      .findOne({ hash: imageObjectReferenceHash }).exec();

    const req = await request(server.app)
      .post('/mobile')
      .set('Accept', 'application/json')
      .send({
        query: imageQuery,
        variables: { hash: imageObjectReferenceHash },
      });

    const { data: { getImage } } = JSON.parse(req.text);

    Object.keys(getImage)
      .forEach(property => expect(getImage[property]).toEqual(imageFromDb[property]));
  });

  it('updateCommentFlow should find proper image and add comment', async () => {
    const userId = '1ab2c3';
    const text = 'some comment';
    const req = await request(server.app)
      .post('/mobile')
      .set('Accept', 'application/json')
      .send({
        query: updateCommentFlowMutation,
        variables: { fileHash: imageObjectReferenceHash, comment: { userId, text } },
      });

    const { data: { updateCommentFlow: { comments: [commentFromResponse] } } } = JSON.parse(req.text);

    const { comments: [commentFromDb] } = await connection.models.CommentFlow
      .findOne({ belongsTo: imageObjectReferenceHash }).exec();

    expect(commentFromResponse.text).toEqual(text);
    expect(commentFromResponse.userId).toEqual(userId);

    Object.keys(commentFromDb)
      .forEach(property => expect(commentFromResponse[property]).toEqual(commentFromDb[property]));
  });

  describe('tag mechanism', () => {
    const getTagContentQuery = `
    query getTagContent($tagName: String!) {
      getTagContent(tagName: $tagName) {
        ... on Image {
          name
          path
          hash
          parentHash
          type
          extension
        }
      }
    }`;

    const newTagName = 'ppl on the moon';
    const userId = 'xcv123';
    let updatedTagFlow;
    let _fileLookup;

    it('creating new Tag to file should work', async () => {
      const fileLookup = {
        hash: imageObjectReferenceHash,
        type: IMAGE,
      };
      _fileLookup = fileLookup;

      const req = await request(server.app)
        .post('/mobile')
        .set('Accept', 'application/json')
        .send({
          query: updateTagFlowMutation,
          variables: {
            fileLookup,
            name: newTagName,
            userId,
          },
        });

      const { data: { updateTagFlow } } = JSON.parse(req.text);
      updatedTagFlow = updateTagFlow;

      expect(updateTagFlow.belongsTo).toBe(imageObjectReferenceHash);
      expect(updateTagFlow.tagPrimitives).toEqual([{ name: newTagName, userId }]);

      const newTag = await connection.models.Tag.findOne({ name: newTagName }).exec();

      expect(JSON.stringify(newTag.fileReferences))
        .toEqual(JSON.stringify([fileLookup]));
      expect(newTag.name).toBe(newTagName);
      expect(newTag.userId).toBe(userId);
    });

    it('can\'t add same tag twice', async () => {
      const req = await request(server.app)
        .post('/mobile')
        .set('Accept', 'application/json')
        .send({
          query: updateTagFlowMutation,
          variables: {
            fileLookup: _fileLookup,
            name: newTagName,
            userId,
          },
        });
      const { data: { updateTagFlow } } = JSON.parse(req.text);

      expect(JSON.stringify(updateTagFlow))
        .toEqual(JSON.stringify(updatedTagFlow));
    });

    it('get specific Tag Content', async () => {
      const req = await request(server.app)
        .post('/mobile')
        .set('Accept', 'application/json')
        .send({
          query: getTagContentQuery,
          variables: {
            tagName: newTagName,
          },
        });

      const { data: { getTagContent: [fileFromResponse] } } = JSON.parse(req.text);
      const fileFromDB = await connection.models[_fileLookup.type]
        .findOne({ hash: _fileLookup.hash }).exec();

      Object.keys(fileFromResponse)
        .forEach(property => expect(fileFromResponse[property]).toEqual(fileFromDB[property]));
    });
  });

  describe('subscriptions api should work', () => {
    let client;

    beforeAll(async () => {
      const httpLink = new HttpLink({ uri: `http://localhost:${config.EXPRESS_PORT}/mobile`, fetch });
      const wsLink = new WebSocketLink({
        uri: `ws://localhost:${config.EXPRESS_PORT}/subscriptions`,
        options: { reconnect: true },
      });
      const link = split(
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query);
          return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        httpLink,
      );
      client = new ApolloClient({ link, cache: new InMemoryCache() });
    });

    it('should get newly added tag on subscription', async () => {
      const newTagName = 'kacsa';
      const userId = 'xyz123';
      const subscriptionPromise = new Promise((resolve, reject) => client.subscribe({
        query: gql`
        subscription newTagAddedToFile($fileHash: Int!) {
          newTagAddedToFile(fileHash: $fileHash) {
            name,
            userId,
          }
        }`,
        variables: { fileHash: imageObjectReferenceHash },
      }).subscribe({
        next: resolve,
        error: reject,
      }));

      await request(server.app)
        .post('/mobile')
        .set('Accept', 'application/json')
        .send({
          query: updateTagFlowMutation,
          variables: {
            fileLookup: {
              hash: imageObjectReferenceHash,
              type: IMAGE,
            },
            name: newTagName,
            userId,
          },
        });

      const { data: { newTagAddedToFile } } = await subscriptionPromise;

      expect(newTagAddedToFile.name).toBe(newTagName);
      expect(newTagAddedToFile.userId).toBe(userId);
      // expect().toEqual({
      //   data: {
      //     newTagAddedToFile: { name: newTagName, userId },
      //   },
      // });
    });
  });
});
