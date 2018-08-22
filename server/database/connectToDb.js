const mongoose = require('mongoose');

const connectToDb = (config) => {
  const connection = mongoose.connect(`mongodb://${config.MONGO_INITDB_ROOT_USERNAME}:${config.MONGO_INITDB_ROOT_PASSWORD}@${config.DB_ALIAS}:${config.MONGO_PORT}/${config.MONGO_INITDB_DATABASE}?authSource=admin`, { poolSize: 10 });

  const imageSchema = new mongoose.Schema({
    name: String,
    url: String,
    hash: Number,
    parentHash: Number,
    thumb: String,
    tags: Array,
    extension: String,
  });

  const folderSchema = new mongoose.Schema({
    name: String,
    path: String,
    contains: Array,
    hash: Number,
  });

  const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    username: String,
    password: String,
    avatar: String,
    enabled: Boolean,
    resetPasswordToken: { type: String, default: null },
    resetPasswordTokenExpires: { type: Number, default: null },
  });

  const commentFlowSchema = new mongoose.Schema({
    comments: Array,
    belongsTo: Number,
  });

  const tagSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    refersTo: Array,
    originalAuthor: String,
  });

  mongoose.model('Folder', folderSchema, 'Folder');
  mongoose.model('CommentFlow', commentFlowSchema, 'CommentFlow');
  mongoose.model('User', userSchema, 'User');
  mongoose.model('Tag', tagSchema, 'Tag');
  mongoose.model('Image', imageSchema, 'Image');

  return connection;
};

module.exports = connectToDb;
