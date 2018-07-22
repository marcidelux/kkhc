'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const config = require('./../../envConfig');

class AdminController {
  
  constructor(dbConnection) {
    this.connection = dbConnection
    this.models = this.connection.models;
  };

  admin() {
    return (req, res) => {
      if (req.headers.adminpassword === config.ADMIN_PASSWORD) {
        console.log('/admin BODY :\n', req.body);
        if (req.body.hasOwnProperty('Command')) {
          switch(req.body.Command) {
            case 'list':
              this.models.User.find()
              .then(users => res.json(users.map(user => {
                return {
                  "username": user.username,
                  "enabled": user.enabled,
                }
              })));
              break;
            case 'seed':
              res.json({ msg: runSeed()});
              break;
            case 'add':
              if (req.body.Username && req.body.Password) {
                this.models.User.findOne({username: req.body.Username})
                .then(user => {
                  res.json({msg: `User: ${user.username} already exists`});
                })
                .catch(err => {
                  bcrypt.hash(req.body.Password, saltRounds, (err, hash) => {
                    if (err) {
                      console.log('ERROR', err);
                    } else {
                      let user_ = new this.models.User({
                        username: req.body.Username,
                        password: hash,
                        enabled: true,
                      });
                      user_.save()
                      .then(() => res.json({ msg: `User created: ${req.body.Username}` }))
                      .catch(err => {
                        res.json({ msg: 'cannot save to DB'});
                      });
                    }
                  });                  
                });
              } else {
                res.json({ msg: "no username or password provided"});
              }
              break;
            case 'reset':
              if (req.body.Username && req.body.Password) {
                this.models.User.findOne({ username: req.body.Username })
                .then(user => {
                  if (!user) {
                    throw Error (`User ${req.body.Username} cannot be found`);
                  } 
                  bcrypt.hash(req.body.Password, saltRounds, (err, hash) => {
                    if (err) {
                      console.log('ERROR', err);
                    } else {
                      user.password = hash;
                      user.save()
                      .then(() => res.json({ msg: `Password of ${req.body.Username} has been changed.` }))
                      .catch(err => {
                        res.json({ msg: 'cannot save to DB'});
                      });
                    }
                  });
                })
                .catch(err => {
                  res.json({msg: `User ${req.body.Username} cannot be found`});                  
                });
              } else {
                res.json({ msg: "no username or password provided"});
              }
              break;
            default:
              res.json({ msg: 'no valid command issued'});
          }
        } else {
          res.json({ msg: 'no command issued'});
        }
      } else {
        res.json({msg: 'you have no rights to do this'})
      }
    };
  };
  
}

module.exports = AdminController;
