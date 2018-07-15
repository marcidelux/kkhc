const mongoose = require('mongoose');

connectToDb = (config) => {
  const connection = mongoose.connect(`mongodb://${config.MONGO_INITDB_ROOT_USERNAME}:${config.MONGO_INITDB_ROOT_PASSWORD}@${config.DB_ALIAS}:${config.DB_PORT}/${config.MONGO_INITDB_DATABASE}?authSource=admin`, { poolSize: 10 });

  const folderSchema = new mongoose.Schema({ 
    name: String,
    path: String,
    contains: Array,
    hash: Number,
  });

  const userSchema = new mongoose.Schema({ 
    username: String,
    password: String,
    email: String,
    avatar: String,
  });

  
  // const chatSchema = new mongoose.Schema({ 
  //   email: String,
  //   body: String,
  //   email: String,
  //   avatar: String,
  // });

  const commentFlowSchema = new mongoose.Schema({ 
    comments: Array,
    belongsTo: Number,
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

  return connection;
}

module.exports = connectToDb
