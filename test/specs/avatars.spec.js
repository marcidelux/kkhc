const mongoose = require('mongoose');

const connectToDb = require('./../../server/database/connectToDb');
const config = require('./../../server/environmentConfig');
const AvatarMapper = require('./../../server/helpers/AvatarMapper');

Object.assign(config, {
  DB_ALIAS: 'test_db',
  MONGO_PORT: '27018',
});

jest.mock('uuid/v4', () => {
  let uuidCounter = -1;
  return () => {
    uuidCounter += 1;
    return uuidCounter;
  };
});

describe('avatars mapping', () => {
  let connection;
  let mapper;
  let originalRenameFileToUuid;

  beforeAll(async (done) => {
    connection = await connectToDb(config);
    originalRenameFileToUuid = AvatarMapper.renameFileToUuid;
    AvatarMapper.renameFileToUuid = jest.fn(() => {});
    mapper = new AvatarMapper(connection, '/opt/test/testAvatars');

    return done();
  });

  afterAll(async (done) => {
    AvatarMapper.renameFileToUuid = originalRenameFileToUuid;
    await connection.models.Avatar.collection.drop();
    await mongoose.connection.close(true);
    return done();
  });

  describe('should find all avatars in folder', () => {
    it('should load images at once', async () => {
      await mapper.saveAvatarsToDb();
      const images = await mapper.findAllAvatarsInDb();
      expect(images.length).toBe(6);
    });

    it("shouldn't load the same avatars twice", async () => {
      expect((await mapper.saveAvatarsToDb()).length).toBe(0);
    });
  });
});
