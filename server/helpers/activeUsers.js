'use strict';

const dev = (require('./../envConfig').NODE_ENV == 'development');
const mongoose = require('mongoose');

let userList = [];
let socketList = [];

function logger(msg) {
  if (dev) {
    console.log('\nActive Users Log\n\n', msg, '\n', JSON.stringify(userList));
  }
};

function usernameToId(userName) {
  let user = userList.find(element => element.username == userName);
  if (user) {
    return user.id;
  };
};

function idToUsername(userID) {
  let user = userList.find(element => element.id == userID);
  if (user) {
    return user.username;
  };
};

function getActiveUsers() {
  return userList.filter(element => element.active);
};

function populateUserList() {
  mongoose.models['User'].find()
  .then(users => {
    userList = users.map(element => {
      return {
        username: element.username,
        id: element._id,
        active: false,
      };
    });
    logger('Populating userList...');
  })
  .catch((err) => {
    logger('Error populating userList');
  });
};

function activateUser(userID) {
  let user = userList.find(element => element.id == userID);
  if (user) {
    userList[userList.map(element => { return element.id }).indexOf(userID)].active = true;
    logger(user.username + ' is active now');
    return 'user is active';
  } else {
    return 'User cannot be found.'
  };
};

function deactivateUser(userID) {
  let user = userList.find(element => element.id == userID);
  if (user) {
    userList[userList.map(element => { return element.id }).indexOf(userID)].active = false;
    logger(user.username + ' is inactive now');
    return 'user is inactive';
  } else {
    return 'User cannot be found.';
  };
};

function addNewUser(userName) {
  mongoose.models['User'].findOne({ username: userName })
  .then(user => {
    userList.push({
      username: user.username,
      id: user._id,
      active: false,
    });
    logger(userName + ' added to userList');
    return userName + ' added to userList';
  })
  .catch(err => {
    logger('Error appending userList with ' + userName);
    return 'error appending userList with ' + userName;
  });
};

module.exports = {
  idToUsername,
  usernameToId,
  populateUserList,
  getActiveUsers,
  activateUser,
  deactivateUser,
  addNewUser,
};