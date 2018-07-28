'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require('mongoose');
const activeUsers = require('./../../helpers/activeUsers');

function checkUserPassword(username, password) {
  return new Promise((resolve,  reject) => {
    mongoose.models['User'].findOne({ username: username }).
    then(user => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res) {
          resolve(user.id);
        } else {
          reject('Wrong password');
        }
      });
    }).catch(err => {
      reject('User not find');
    });
  });
};

function validPassword(password) {
  if (typeof password == 'string') {
    if (password.length > 2) {
      return true;
    };
  };
  return false;
}

function validUsername(username) {
  if (typeof username == 'string') {
    if ((username.length > 2) && (username.length < 19)) {
      return true;
    };
  };
  return false;
}

const BaseController = require('./../BaseController');

class NavigationController extends BaseController {
  
  constructor(dbConnection) {
    super(dbConnection);
  };

  auth() {
    return (req, res) => {      
      if ((req.body.username.length > 0) && (req.body.password.length > 0)) {
        checkUserPassword(req.body.username, req.body.password)
        .then(msg => {
          console.log('AUTH MSG\n', msg);
          req.session.authenticated = true;
          req.session.userID = msg;
          activeUsers.activateUser(activeUsers.idToUsername(msg));
          res.json({ Success: 'Successfully authenticated' }); 
        }).catch(err => {
          console.log('\nAUTH ERROR\n', JSON.stringify(err));
          console.log(err);
          res.json({ Error: err});
        });
      } else {
        res.json({ Error: 'no username and/or Password provided' });
      };
    };
  };

  logout() {
    return (req, res) => {
      if (req.session.hasOwnProperty('userID')) {
        activeUsers.deactivateUser(activeUsers.idToUsername(req.session.userID));
      }
      req.session.destroy();
      res.send('Logged out');
    };
  };
  
  updateuser() {
    return (req, res) => {
      if (req.session.authenticated) {
        if (!(req.body.hasOwnProperty('currentPassword'))) {
          res.json({ Error: 'no password provided'})
        } else if (!(req.body.hasOwnProperty('newPassword')) && !(req.body.hasOwnProperty('newUsername'))) {
          res.json({ Error: 'nothing to change' });
        } else {
          mongoose.models['User'].findOne({ _id: req.session.userID })
          .then(user => {
            let error = '';
            let result = '';
            bcrypt.compare(req.body.currentPassword, user.password, (err, hashReturn) => {
              if(err) {
                res.json({ Error: 'wrong password' });                
              } else {
                if (validUsername(req.body.newUsername)) {
                  user.username = req.body.newUsername;
                  result += 'username has been changed to ' + req.body.newUsername + ' ';
                } else {
                  error += 'invalid new username ';
                };
                if (validPassword(req.body.newPassword)) {
                  bcrypt.hash(req.body.newPassword, saltRounds, (err, hash) => {
                    if (err) {
                      console.log('ERROR', err);
                      error += 'error during encrypt ';
                    } else {
                      user.password = hash;
                      result += 'password has been changed for ' + user.username + ' ';
                    }
                  });
                };
                user.save()
                .then(() => {
                  res.json({ 
                    Msg: result,
                    Error: error
                  });
                })
                .catch(err => {
                  res.json({ Error: 'cannot save to database'});
                });
              };            
            });
          }).catch(err => {
            res.json({ Error: 'Cannot read database' });
          });
        };
      } else {
        res.json({ Error: 'not authenticated' });
      }
    };
  };


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
    }
  }

  root() {
    return (req, res) => {
      if (req.session.authenticated) {
        res.render('home');
      } else {
        res.render('login');
      }
    };
  };

  home() {
    return (req, res) => {
      res.render('home');
    };
  };

  ribbit() {
    return (req, res) => {
      res.render('ribbit');
    };
  };

  drive() {
    return (req, res) => {
      res.render('drive');
    };
  };

  games() {
    return (req, res) => {
      res.render('games');
    };
  };

  options() {
    return (req, res) => {
      this.models.User.findOne({ _id: req.session.userID }).then(user => {
        let user_ = {
          username: user.username,
          userID: req.session.userID
        }
        console.log('USER OBJ :\n', user_);
        res.render('options', { data: user_ });
      });
    };
  };
};

module.exports = NavigationController;
