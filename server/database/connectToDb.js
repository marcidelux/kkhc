const mongoose = require('mongoose');

connectToDb = (config) => {
  const connection = mongoose.connect(`mongodb://${config.MONGO_INITDB_ROOT_USERNAME}:${config.MONGO_INITDB_ROOT_PASSWORD}@${config.DB_ALIAS}:${config.MONGO_PORT}/${config.MONGO_INITDB_DATABASE}?authSource=admin`, { poolSize: 10 });

  const imageSchema = new mongoose.Schema({
    name: String,
    url: String,
    hash: Number,
    thumb: String,
    tags: Array,
    commentFlow: String,
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

  // const chatSchema = new mongoose.Schema({ 
  //   email: String,
  //   body: String,
  //   email: String,
  //   avatar: String,
  // });

  const commentFlowSchema = new mongoose.Schema({ 
    comments: Array,
  });

  const tagSchema = new mongoose.Schema({ 
    name: { type: String, unique: true },
    refersTo: Array,
    originalAuthor: String,
  });

  const Folder = mongoose.model('Folder', folderSchema, 'Folder');
  const CommentFlow = mongoose.model('CommentFlow', commentFlowSchema, 'CommentFlow');
  const User = mongoose.model('User', userSchema, 'User');
  const Tag = mongoose.model('Tag', tagSchema, 'Tag');
  const Image = mongoose.model('Image', imageSchema, 'Image');

  return connection;
}

module.exports = connectToDb
