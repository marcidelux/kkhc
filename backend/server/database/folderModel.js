
const mongoose = require('mongoose');

module.exports = mongoose.model('folders', { 
  name: String,
  path: String,
  contains: Array,
  hash: Number
}, 'folders')
