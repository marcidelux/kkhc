'use strict';

const bcrypt = require('bcrypt');

class NavigationController {
  
  constructor(dbConnection) {
    this.connection = dbConnection
    this.models = this.connection.models;
  };

  auth() {
    return (req, res) => {      
      if ((req.body.username.length > 0) && (req.body.password.length > 0)) {
        this.models.User.findOne({ username: req.body.username })
        .then((user) => {
          console.log('USER ???', user);
          bcrypt.compare(req.body.password, user.password, function(err, hashReturn) {
            if (err) {
              console.log('HASH ERROR', err);
            } else {
              if (hashReturn) {
                req.session.authenticated = true;
                req.session.userID = user.id;
                res.json({ Success: 'Successfully authenticated' });
              } else {
                res.json({ Error: 'wrong password' });
              }
            }
          });
        }).catch(err =>
          res.json({ Error: 'User not found' })
        );
      } else {
        res.json({ Error: 'no username and/or Password provided' });
      }
    };
  };

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
        res.render('options', { username: user.username });
      });
    };
  };
};

module.exports = NavigationController;
