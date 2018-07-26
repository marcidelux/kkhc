'use strict';

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

function checkUserPassword(username, password) {
  return new Promise((resolve,  reject) => {
    mongoose.models['User'].findOne({ username: username }).
    then(user => {
      console.log('USER FOUND');
      bcrypt.compare(password, user.password, function(err, hashReturn) {
        if(err) {
          reject('Wrong password');
        } else {
          resolve(user.id);
        }
      });
    }).catch(err => {
      console.log('ERROR');
      reject('User not find')
    });
  });
}

class NavigationController {
  
  constructor(dbConnection) {
    this.connection = dbConnection
    this.models = this.connection.models;
  };

  auth() {
    return (req, res) => {      
      if ((req.body.username.length > 0) && (req.body.password.length > 0)) {
        checkUserPassword(req.body.username, req.body.password)
        .then(msg => {
          req.session.authenticated = true;
          req.session.userID = msg;
          res.json({ Success: 'Successfully authenticated' }); 
        }).catch(err => {
          res.json({ Error: err});
        })
      } else {
        res.json({ Error: 'no username and/or Password provided' });
      }
    }
  }

  logout() {
    return (req, res) => {
      req.session.destroy();
      res.send('Logged out');
    }
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
