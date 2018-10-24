const mongoose = require('mongoose');
const {
  DRIVE_FILES: {
    FOLDER,
    IMAGE,
    VIDEO,
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
    [IMAGE.TYPE]: new mongoose.Schema({
      name: String,
      path: String,
      type: { type: String, default: IMAGE.TYPE },
      hash: { type: Number, index: { unique: true } },
      parentHash: Number,
      extension: String,
    }),

    [VIDEO.TYPE]: new mongoose.Schema({
      name: String,
      path: String,
      type: { type: String, default: VIDEO.TYPE },
      hash: { type: Number, index: { unique: true } },
      parentHash: Number,
      extension: String,
    }),

    [FOLDER.TYPE]: new mongoose.Schema({
      name: String,
      path: String,
      type: { type: String, default: FOLDER.TYPE },
      contains: Array,
      hash: { type: Number, index: { unique: true } },
      hashPath: Array,
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
      id: { type: Number, index: { unique: true } },
      userId: String,
      message: String,
      date: String,
    }),

    CommentFlow: new mongoose.Schema({
      comments: Array,
      belongsTo: { type: Number, index: { unique: true } },
    }),

    TagFlow: new mongoose.Schema({
      tagPrimitives: Array,
      belongsTo: { type: Number, index: { unique: true } },
    }),

    Tag: new mongoose.Schema({
      // @todo - before create handler ... for 'ATB' 'atb' 'Atb' |> to result to 'atb' !
      name: { type: String, unique: true },
      fileReferences: Array,
      userId: String,
    }),

    Avatar: new mongoose.Schema({
      nameOnDisc: { type: String, index: { unique: true } },
      extension: String,
    }),
  };

  Object.entries(schemas)
    .forEach(([key, schema]) => mongoose.model(key, schema, key));

  return connection;
};

module.exports = connectToDb;
