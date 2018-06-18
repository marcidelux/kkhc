const mongoose = require('mongoose');

const connection = mongoose.createConnection('mongodb://karma:coldcold@db:27017/kkhcfiles?authSource=admin');

const folderSchema = new mongoose.Schema({ 
  name: String,
  path: String,
  contains: Array,
  hash: Number
});

const userSchema = new mongoose.Schema({ 
  username: String,
  password: String,
  email: String,
  avatar: String,
});

const Folder = connection.model('folders', folderSchema, 'folders');

const User = connection.model('users', userSchema, 'users');

function findFolderByHash(hash){
  return Folder.findOne({ hash });
}

function findUserByEmail(email, onError, onResult){
  User.findOne({ email }, (err, res) => { 
    if (err) {
      onError(err);
    } else { 
      onResult(res);
    }
  });
}

module.exports = {User, Folder, connection, findFolderByHash, findUserByEmail};
