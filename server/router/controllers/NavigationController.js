const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const CONSTANTS = require('./../../constants');

const memDB = require('./../../helpers/InMemoryDB').db;

// @todo lot of refactoring & update user mechanism

function checkUserPassword(obj, password) {
  return new Promise((resolve, reject) => {
    const user_ = memDB.getUser(obj);
    if (user_) {
      mongoose.models.User
        .findOne({ username: user_.username })
        .then((user) => {
          bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
              resolve(user.id);
            } else {
              reject('Wrong password');
            }
          });
        })
        .catch((err) => {
          reject('User not found');
        });
    } else {
      reject('User not found');
    }
  });
}

function validPassword(password) {
  if (typeof password === 'string') {
    if (password.length > 2) {
      return 'valid';
    }
    return 'password too short';
  }
  return 'type error';
}

function validUsername(username) {
  const user = memDB.getUser({ username });
  if (user) {
    return 'username already in use';
  }
  if (typeof username === 'string') {
    if (username.length > 2 && username.length < 19) {
      return 'valid';
    }
    return 'length error';
  }
  return 'type error';
}

function validEmail(email) {
  const user = memDB.getUser({ email });
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (user) {
    return 'email already in use';
  }
  if (typeof email === 'string') {
    if (re.test(email)) {
      return 'valid';
    }
  }
  return 'type error';
}

function validateUpdate(updateObj) {
  for (let key of Object.keys(updateObj)) {
    switch (key) {
      case password:
        let isValidPassword = validPassword(updateObj.password);
        if (isValidPassword != 'valid') {
          return isValidPassword;
        }
        break;
      case username:
        let isValidUsername = validUsername(updateObj.username);
        if (isValidUsername != 'valid') {
          return isValidUsername;
        }
        break;
      case email:
        let isValidEmail = validEmail(updateObj.email);
        if (isValidEmail != 'valid') {
          return isValidEmail;
        }
        break;
    }
  }
  return 'valid';
}

function updateDB(id, updateObj) {
  return new Promise((resolve, reject) => {
    const isvalid = validateUpdate(updateObj);
    if (isvalid !== 'valid') {
      reject(isvalid);
    }
    mongoose.models.User
      .findOne({ _id: id })
      .then((user) => {
        for (let key of Object.keys(updateObj)) {
          if (key == 'password') {
            bcrypt.hash(updateObj.password, CONSTANTS.SALT_ROUNDS, (err, hash) => {
              if (err) {
                reject(err);
              } else {
                updateObj.password = hash;
              }
            });
          }
          user[key] = updateObj[key];
        }
        user.save().then(msg => {
          memDB.updateUser(user);
          resolve(`${user.username} has been updated`);
        });
      })
      .catch(err => {
        reject('database error');
      });
  });
}

const BaseController = require('./../BaseController');

class NavigationController extends BaseController {
  constructor(dbConnection) {
    super(dbConnection);
  }

  auth() {
    return (req, res) => {
      if (req.body.username.length > 0 && req.body.password.length > 0) {
        checkUserPassword({ username: req.body.username }, req.body.password)
          .then(msg => {
            console.log('AUTH MSG\n', msg);
            req.session.userID = msg;
            req.session.authenticated = true;
            memDB.activateUser({ id: req.session.userID });
            res.json({ Success: 'Successfully authenticated' });
          })
          .catch(err => {
            console.log('\nAUTH ERROR\n', JSON.stringify(err));
            console.log(err);
            res.json({ Error: err });
          });
      } else {
        res.json({ Error: 'no username and/or Password provided' });
      }
    };
  }

  logout() {
    return (req, res) => {
      if (req.session.hasOwnProperty('userID')) {
        memDB.deactivateUser({ id: req.session.userID });
      }
      req.session.destroy();
      res.send('Logged out');
    };
  }

  updateuser() {
    return (req, res) => {
      checkUserPassword({ id: req.session.userID }, req.body.currentPassword)
        .then(msg => {
          updateDB(msg, req.body.update).then(msg => {
            res.json({ msg: msg });
          });
        })
        .catch(err => {
          res.json({ Error: 'wrong password' });
        });
    };
  }

  identify() {
    return (req, res) => {
      if (req.session.authenticated) {
        res.json({
          sid: req.session.id,
          userid: req.session.userID,
        });
      } else {
        res.json({ msg: 'Not authenticated' });
      }
    };
  }

  root() {
    return (req, res) => {
      if (req.session.authenticated) {
        res.render('home');
      } else {
        res.render('login');
      }
    };
  }

  home() {
    return (req, res) => {
      res.render('home');
    };
  }

  ribbit() {
    return (req, res) => {
      res.render('ribbit');
    };
  }

  drive() {
    return (req, res) => {
      res.render('drive');
    };
  }

  games() {
    return (req, res) => {
      res.render('games');
    };
  }

  options() {
    return (req, res) => {
      res.render('options', {
        data: memDB.getUser({ id: req.session.userID }),
      });
    };
  }
}

module.exports = NavigationController;
