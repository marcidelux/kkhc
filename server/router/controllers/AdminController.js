

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const config = require('./../../envConfig');
const { seedDB } = require('../../database/dbSeed');
const { db: memDB } = require('./../../helpers/InMemoryDB');
const BaseController = require('./../BaseController');
const AvatarMapper = require('./../../helpers/AvatarMapper');


// @todo test this endpoint without jest race-conditions
class AdminController extends BaseController {
  constructor(dbConnection) {
    super(dbConnection);
    this.avatarMapper = new AvatarMapper(this.connection);

    this.utilities = {
      saltRounds: 10,
      seeder: async (conn, res) => {
        try {
          await seedDB(conn);
          res.json({ msg: 'Database successfully seeded' });
        } catch (err) {
          res.json({ msg: 'Error seeding database' });
        }
      },
      getCollectionsInfo: async (collList) => {
        const allCollections = [];
        collList.forEach(async (collection) => {
          allCollections.push(new Promise((resolve) => {
            mongoose.models[collection.name].countDocuments({}, (err, sum) => {
              if (err) {
                throw new Error('Cannot read database');
              } else {
                resolve({ Name: `${collection.name}  [ ${sum} ]` });
              }
            });
          }));
        });
        return Promise.all(allCollections);
      },
    };

    this.handlers = {

      listCollections: (req, res) => mongoose.connection.db.listCollections()
        .toArray(async (err, collList) => {
          if (err) {
            res.json({ msg: 'Cannot read database' });
          } else {
            const response = await this.utilities.getCollectionsInfo(collList);
            res.json({ msg: response });
          }
        }),

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
          return res.json({ msg: 'No files were uploaded.' });
        }
        try {
          await this.avatarMapper.addNewAvatarFromRemote(req.files.avatar);
          res.json({ msg: 'Avatar file successfully uploaded' });
        } catch (err) {
          res.json({ msg: 'Cannot save avatarfile' });
        }
      },

      flushDbCollection: (req, res) => {
        const { body: { collection } } = req;
        if (!collection) {
          return res.json({ msg: 'No collection provided' });
        }
        mongoose.connection.db.listCollections()
          .toArray((err, collList) => {
            if (err) return res.json({ msg: 'Cannot read database' });

            const collectionNames = [...collList.map(c => c.name)];
            if (collectionNames.includes(collection)) {
              mongoose.connection.db.dropCollection(collection, (innerErr) => {
                if (innerErr) {
                  res.json({ msg: `Cannot flush ${collection}` });
                } else {
                  res.json({ msg: `Collection ${collection} has been flushed` });
                }
              });
            } else {
              res.json({ msg: `Collection ${collection} cannot be found` });
            }
          });
      },

      getUsersInfo: async (req, res) => {
        const allUsers = (await this.models.User.find({}).exec())
          .map(({ username, email }) => ({ username, email }));
        res.json({ msg: allUsers });
      },

      addUser: async (req, res) => {
        const { body: { email, password, username } } = req;
        if (email && password && username) {
          const userWithSameEmail = await this.models.User.findOne({ email }).exec();
          if (userWithSameEmail) {
            res.json({ msg: `User: ${userWithSameEmail.email} already exists` });
          } else {
            try {
              const hash = await bcrypt.hash(password, this.utilities.saltRounds);
              const user = new this.models.User({
                username,
                password: hash,
                email,
                avatar: '',
                color: '',
                isOnline: false,
              });
              await user.save();
              memDB.addNewUser(user);
              res.json({ msg: `User created: ${username}` });
            } catch (error) {
              console.log(`DB ERROR !!!!!\n${error}`);
              res.json({ msg: 'cannot save to DB' });
            }
          }
        } else {
          res.json({ msg: 'no username or password provided' });
        }
      },

      resetUserPassword: async (req, res) => {
        const { body: { email, password } } = req;
        if (email && password) {
          try {
            const user = await this.models.User.findOne({ email }).exec();
            if (!user) {
              res.json({ msg: 'can\'t found user' });
            } else {
              const hash = await bcrypt.hash(password, this.utilities.saltRounds);

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
    return async (req, res) => {
      const {
        headers: { adminpassword, command },
      } = req;
      if (adminpassword === config.ADMIN_PASSWORD) {
        if (command) {
          this.handlers[command]
            ? await this.handlers[command](req, res)
            : res.json({ msg: 'no valid command issued' });
        } else {
          res.json({ msg: 'no command issued' });
        }
      } else {
        res.json({ msg: 'you have no rights to do this' });
      }
    };
  }
}

module.exports = AdminController;
