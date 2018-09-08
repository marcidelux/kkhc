const mongoose = require('mongoose');

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
      url: String,
      hash: Number,
      parentHash: Number,
      thumb: String,
      tags: Array,
      extension: String,
    }),

    Folder: new mongoose.Schema({
      name: String,
      path: String,
      contains: Array,
      hash: Number,
    }),

    User: new mongoose.Schema({
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
      belongsTo: Number,
    }),

    Tag: new mongoose.Schema({
      name: { type: String, unique: true },
      refersTo: Array,
      originalAuthor: String,
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
