'use strict';

const dev = (require('./../envConfig').NODE_ENV == 'development');

const _ = require('lodash');


class InMemoryDB {
  
  constructor () {
    this.users = [];
    this.sockets = [];
  }

  logger(msg) {
    if (dev) {
      console.log(`\nInMemoryDB LOG\n\n${msg}\n${JSON.stringify(this.users)}\n${JSON.stringify(this.sockets)}`);
    }
  };
  
  populateUserList(dbConnection) {
    return new Promise ((resolve, reject) =>
      dbConnection.models.User.find()
      .then(users => {
        this.users = users.map(element => {
          return {
            id: String(element._id),
            username: element.username,
            email: element.email,          
            active: false,
          };
        });
        this.logger('Populating userList...');
        resolve('InMemoryDatabase populated with users')
      })
      .catch((err) => {
        this.logger('Error populating userList');
        reject('Error populating the InMemoryDatabase with users');
      })
    );
  };

  getUsers() {
    this.logger('Get Users');
    return this.users;
  }

  usernameToId(userName) {
    let user = _.find(this.users, { username: userName });
    if (user) {
      return user.id
    };
  };
  
  idToUsername(userID) {
    let user = _.find(this.users, { id: String(userID) });
    if (user) {
      return user.username;
    };
  };
  
  getActiveUsers() {
    return _.filter(this.users, { active: true });
  };
  
  activateUser(obj) {
    for (let key of Object.keys(obj)) {
      let user = _.find(this.users, [key, obj[key]]);
      if (user) {
        let index = _.findIndex(this.users, { id: user.id});
        this.users[index].active = true;
        return `User activated ${user.username}`;
      };
    };
    return undefined;
  };
  
  deactivateUser(obj) {
    for (let key of Object.keys(obj)) {
      let user = _.find(this.users, [key, obj[key]]);
      if (user) {
        let index = _.findIndex(this.users, { id: user.id});
        this.users[index].active = false;
        return `User deactivated ${user.username}`;
      };
    };
    return undefined;
  };
  
  addNewUser(user) {
    let newUser = {};
    for (let key of Object.keys(user)) {
      newUser[key] = String(user[key]);
    };
    newUser.active = false;
    this.users.push(newUser);
    return `New user added ${user.username}`;
  };
  
  getUser(obj) {
    for (let key of Object.keys(obj)) {
      let user = _.find(this.users, [key, obj[key]]);
      if (user) {
        return user;
      };
    };
  };

  updateUser(user) {
    this.logger('Userupdate');
    if (!(user.id)) {
      if (user._id) {
        user.id = String(user._id);
      } else {
        return
      };
    };
    let index = _.findIndex(this.users, { id: user.id });
    for (let key of Object.keys(user)) {
      this.users[index][key] = user[key];
    };
    this.logger('Userupdate----------------------------!');
    return this.users[index];
  };

};

module.exports = {
  db : new InMemoryDB()
};