const mongoose = require('mongoose');
const {
  DRIVE_FILE_TYPES: {
    FOLDER,
    IMAGE,
  },
} = require('./../constants');

const connectToDb = (config) => {
  const connection = mongoose.connect(
    `mongodb://${config.MONGO_INITDB_ROOT_USERNAME}:${config.MONGO_INITDB_ROOT_PASSWORD}@${config.DB_ALIAS}:${config.MONGO_PORT}/${config.MONGO_INITDB_DATABASE}?authSource=admin`,
    {
      poolSize: 10,
      useNewUrlParser: true,
    },
  );

  const schemas = {
    Image: new mongoose.Schema({
      name: String,
      path: String,
      type: { type: String, default: IMAGE },
      hash: { type: Number, index: { unique: true } },
      parentHash: Number,
      extension: String,
    }),

    Folder: new mongoose.Schema({
      name: String,
      path: String,
      type: { type: String, default: FOLDER },
      contains: Array,
      hash: { type: Number, index: { unique: true } },
    }),

    User: new mongoose.Schema({
      // generate uuid?
      email: { type: String, unique: true, required: true },
      username: String,
      password: String,
      avatar: String,
      color: String,
      isOnline: Boolean,
      resetPasswordToken: { type: String, default: null },
      resetPasswordTokenExpires: { type: Number, default: null },
    }),

    ChatMessage: new mongoose.Schema({
      userId: String,
      message: String,
      date: String,
    }),

    CommentFlow: new mongoose.Schema({
      comments: Array,
      belongsTo: { type: Number, index: { unique: true } },
    }),

    TagFlow: new mongoose.Schema({
      tagNames: Array,
      belongsTo: { type: Number, index: { unique: true } },
    }),

    Tag: new mongoose.Schema({
      // @todo - before create handler ... for 'ATB' 'atb' 'Atb' |> to result to 'atb' !
      name: { type: String, unique: true },
      fileReferences: Array,
      userId: String,
    }),

    Avatar: new mongoose.Schema({
      nameOnDisc: String,
      extension: String,
    }),
  };

  Object.entries(schemas)
    .forEach(([key, schema]) => mongoose.model(key, schema, key));

  return connection;
};

module.exports = connectToDb;
