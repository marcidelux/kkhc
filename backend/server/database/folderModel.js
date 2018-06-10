const mongoose = require('mongoose');

let connection = mongoose.createConnection('mongodb://karma:coldcold@db:27017/kkhcfiles?authSource=admin');

let folderSchema = new mongoose.Schema({ 
  name: String,
  path: String,
  contains: Array,
  hash: Number
});

let Folder = connection.model('folders', folderSchema, 'folders')

module.exports = {Folder, connection};
