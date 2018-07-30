'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require('mongoose');
const memDB = require('./../../helpers/InMemoryDB').db;

function checkUserPassword(obj, password) {
  return new Promise((resolve,  reject) => {
    let user_ = memDB.getUser(obj);
    if (user_) {
      mongoose.models['User'].findOne({ username: user_.username }).
      then(user => {
        bcrypt.compare(password, user.password, (err, res) => {
          if(res) {
            resolve(user.id);
          } else {
            reject('Wrong password');
          }
        });
      }).catch(err => {
        reject('User not found');
      });
    } else {
      reject('User not found');
    };
  });
};

function validPassword(password) {
  console.log(1111)
  if (typeof password === 'string') {
    if (password.length > 2) {
      console.log(1111)
      return true;
    };
  };
  return false;
}

function validUsername(username) {
  if (typeof username === 'string') {
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
        checkUserPassword({ username: req.body.username }, req.body.password)
        .then(msg => {
          console.log('AUTH MSG\n', msg);
          req.session.userID = msg;
          req.session.authenticated = true;          
          memDB.activateUser({ id: req.session.userID });
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
        memDB.deactivateUser({ id: req.session.userID });
      }
      req.session.destroy();
      res.send('Logged out');
    };
  };
  
  updateuser() {
    return (req, res) => {
      if (!(req.session.authenticated)) {
        res.json({ Error: 'not authenticated' });
        return;
      };
      if (!(req.body.hasOwnProperty('newPassword')) && !(req.body.hasOwnProperty('newUsername'))) {
        res.json({ Error: 'nothing to change' });
        return;
      };
      checkUserPassword({ id: req.session.userID }, req.session.currentPassword)
      .then(msg => {
        if (req.body.hasOwnProperty('newPassword')) {
          updatePassword({ id: req.body.userID }, req.body.newPassword)
          .then(msg => {
            
          }).catch(err => {
            
          });
        };
      })
      .catch(err => {
        res.json({ Error: 'wrong password' });
      });
    };
  };
  //     mongoose.models['User'].findOne({ _id: req.session.userID })
  //     .then(user => {
  //           let error = '';
  //           let result = '';
  //           bcrypt.compare(req.body.currentPassword, user.password, (err, hashReturn) => {
  //             if(err) {
  //               res.json({ Error: 'wrong password' });                
  //             } else {
  //               if (validUsername(req.body.newUsername)) {
  //                 user.username = req.body.newUsername;
  //                 result += 'username has been changed to ' + req.body.newUsername + ' ';
  //               } else {
  //                 error += 'invalid new username ';
  //               };
  //               if (validPassword(req.body.newPassword)) {
  //                 bcrypt.hash(req.body.newPassword, saltRounds, (err, hash) => {
  //                   if (err) {
  //                     console.log('ERROR', err);
  //                     error += 'error during encrypt ';
  //                   } else {
  //                     user.password = hash;
  //                     result += 'password has been changed for ' + user.username + ' ';
  //                     user.save()
  //                     .then(() => {
  //                       memDB.updateUser(user);
  //                       res.json({ 
  //                         Msg: result,
  //                         Error: error
  //                       });
  //                     })
  //                     .catch(err => {
  //                       res.json({ Error: 'cannot save to database'});
  //                     });
  //                   }
  //                 });
  //               };
                
  //             };            
  //           });
  //         }).catch(err => {
  //           res.json({ Error: 'Cannot read database' });
  //         });
  //       };
  //     } else {
  //       res.json({ Error: 'not authenticated' });
  //     }
  //   };
  // };


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
      res.render('options', { data: memDB.getUser({ id: req.session.userID }) });

    //   this.models.User.findOne({ _id: req.session.userID }).then(user => {
    //     let user_ = {
    //       username: user.username,
    //       userID: req.session.userID
    //     }
    //     console.log('USER OBJ :\n', user_);
    //     res.render('options', { data: user_ });
    //   });
    };
  };

};

module.exports = NavigationController;
