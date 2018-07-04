const mongoose = require('mongoose');
const {
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD,
    MONGO_INITDB_DATABASE, 
} = require('./../envConfig');

// const connection = mongoose.createConnection(`mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@db:27017/${MONGO_INITDB_DATABASE}?authSource=admin`, { poolSize: 10 });
const connection = mongoose.createConnection(`mongodb://test_super:stub@test_db:27017/test_kkhcfiles?authSource=admin`, { poolSize: 10 });


connection.on('connected', function(){
  console.log('connected')
});

connection.on('disconnected', function(){
  console.log('disconnected')
});

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

const commentFlowSchema = new mongoose.Schema({ 
  comments: Array,
  belongsTo: Number,
});

const tagSchema = new mongoose.Schema({ 
  name: { type: String, unique: true },
  refersTo: Array,
  originalAuthor: String,
});

const Folder = connection.model('folders', folderSchema, 'folders');

const CommentFlow = connection.model('commentFlows', commentFlowSchema, 'commentFlows');

const User = connection.model('users', userSchema, 'users');

const Tag = connection.model('tags', tagSchema, 'tags');

function findFolderByHash(hash){
  return Folder.findOne({ hash });
}

function findUserByEmail(email) {
  return User.findOne({ email })
}

function findCommentFlowById(id) {
  return CommentFlow.findById(id)
}

function findTagByName(name) {
  return Tag.findOne({ name })
}

module.exports = {
  connection,
  User,
  Folder,
  CommentFlow,
  Tag,
  findCommentFlowById,
  findFolderByHash,
  findUserByEmail,
  findTagByName,
};
