
const mongoose = require('mongoose');

// const Folder = 

module.exports = mongoose.model('folders', { name: String, path: String, contains: Array }, 'folders')