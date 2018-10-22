const bcrypt = require('bcrypt');
const R = require('ramda');
const mongoose = require('mongoose');

const config = require('./../../environmentConfig');
const { seedDB } = require('../../database/dbSeed');
const BaseController = require('./../BaseController');
const AvatarMapper = require('./../../helpers/AvatarMapper');
const CONSTANTS = require('./../../constants');

// @todo test this endpoint without jest race-conditions
class AdminController extends BaseController {
  constructor(dbConnection) {
    super(dbConnection);
    this.avatarMapper = new AvatarMapper(this.connection);

    this.utilities = {
      seeder: async (connection, res) => {
        try {
          await seedDB(connection);
          res.json({ msg: 'Database successfully seeded' });
        } catch (error) {
          res.json({ msg: error });
        }
      },

      formatCollectionInfo: (name, sum) => ({ Name: `${name}  [ ${sum} ]` }),

      getCollectionsInfo: async (collectionNames) => {
        const documentCounts = await Promise
          .all(collectionNames.map(c => mongoose.models[c].countDocuments({})));
        return R
          .zipWith(this.utilities.formatCollectionInfo, collectionNames, documentCounts);
      },
    };

    this.handlers = {
      listCollections: async (req, res) => {
        try {
          const collectionNames = Object.keys(this.connection.models);
          res.json({ msg: (await this.utilities.getCollectionsInfo(collectionNames)) });
        } catch (error) {
          res.json({ msg: 'Cannot read Database.' });
        }
      },

      seedDbWithDriveFiles: (req, res) => this.utilities.seeder(this.connection, res),

      seedAvatars: async (req, res) => {
        const savedInstances = await this.avatarMapper.saveAvatarsToDb();
        res.json({ msg: `saved: ${savedInstances.length} new avatars` });
      },

      getAvatars: async (req, res) => {
        const allAvatars = (await this.models.Avatar.find({}).exec())
          .map(({ nameOnDisc, extension }) => ({ nameOnDisc, extension }));
        res.json({ msg: allAvatars });
      },

      addAvatars: async (req, res) => {
        if (!req.files) {
          return res.json({ msg: 'No files were found to upload.' });
        }
        try {
          await this.avatarMapper.addNewAvatarFromRemote(req.files.avatar);
          res.json({ msg: 'Avatar file successfully uploaded' });
        } catch (error) {
          res.json({ msg: 'Cannot save avatar' });
        }
      },

      flushDbCollection: ({ body: { collection: collectionName } }, res) => {
        // @todo flush multiple at once
        if (!collectionName) return res.json({ msg: 'No collection provided' });
        const collectionNames = Object.keys(this.connection.models);
        if (collectionNames.includes(collectionName)) {
          this.connection.models[collectionName].collection.drop();
          res.json({ msg: `Collection ${collectionName} has been flushed` });
        } else {
          res.json({ msg: `Collection ${collectionName} cannot be found` });
        }
      },

      getUsersInfo: async (req, res) => {
        const allUsers = (await this.models.User.find({}).exec())
          .map(({ username, email }) => ({ username, email }));
        res.json({ msg: allUsers });
      },

      addUser: async ({ body: { email, password, username } }, res) => {
        if (email && password && username) {
          const userWithSameEmail = await this.models.User.findOne({ email }).exec();
          if (userWithSameEmail) {
            res.json({ msg: `User: ${userWithSameEmail.email} already exists` });
          } else {
            try {
              const hash = await bcrypt.hash(password, CONSTANTS.SALT_ROUNDS);
              const user = new this.models.User({
                username,
                password: hash,
                email,
                avatar: '',
                color: '',
                isOnline: false,
              });
              await user.save();
              res.json({ msg: `User created: ${username}` });
            } catch (error) {
              res.json({ msg: 'cannot save to DB' });
            }
          }
        } else {
          res.json({ msg: 'no username or password provided' });
        }
      },

      resetUserPassword: async ({ body: { email, password } }, res) => {
        if (email && password) {
          try {
            const user = await this.models.User.findOne({ email }).exec();
            if (!user) {
              res.json({ msg: 'can\'t found user' });
            } else {
              const hash = await bcrypt.hash(password, CONSTANTS.SALT_ROUNDS);

              user.password = hash;
              await user.save();

              res.json({ msg: `Password of ${email} has been changed.` });
            }
          } catch (error) {
            res.json({ msg: 'cannot save to DB' });
          }
        } else {
          res.json({ msg: 'no username or password provided' });
        }
      },
    };
  }

  admin() {
    return async (request, response) => {
      const {
        headers: { adminpassword, command },
      } = request;
      if (adminpassword === config.ADMIN_PASSWORD) {
        if (command) {
          this.handlers[command]
            ? await this.handlers[command](request, response)
            : response.json({ msg: 'no valid command issued' });
        } else {
          response.json({ msg: 'no command issued' });
        }
      } else {
        response.json({ msg: 'you have no rights to do this' });
      }
    };
  }
}

module.exports = AdminController;
