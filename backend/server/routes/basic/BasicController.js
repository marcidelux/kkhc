'use strict';

// const Folder = require('./../../database/folderModel').Folder;
// const connection = require('./../../database/folderModel').connection;

const {findFolderByHash} = require('./../../database/folderModel');
const {findUserByEmail} = require('./../../database/folderModel');
const User = require('./../../database/folderModel').User;
const bcrypt = require('bcrypt');
const saltRounds = 10;

class BasicController {
  
  constructor() {};

  home() {
    return (req, res) => {
        res.render('home');
    };
  };
  
  addUser() {
    return (req, res) => {
      let myHash = '';
      bcrypt.hash('123', saltRounds, function(err, hash) {
        if (err) {
          console.log('ERROR', err);
        } else {
          myHash = hash;
          console.log('HASHED ', myHash);
          let user_ = new User({ email: 'asd@wasd.gov', password: myHash, avatar: 'apád' });
          user_.save();
          res.json({ msg: 'user added' });
        }
      });
    };
  };
  
  auth() {
    return (req, res) => {      
      if (req.body.email.length > 0) {
        findUserByEmail(req.body.email, err => {
          res.json({ Error: 'DB error' });
        }, user => {
          if (user) {
            bcrypt.compare(req.body.password, user.password, function(err, hashReturn) {
              if (err) {
                console.log('ERROR', err);
              } else {
                if (hashReturn) {
                  req.session.authenticated = true;
                  res.json({ Success: 'Successfully authenticated' });
                } else {
                  res.json({ Error: 'wrong password' });
                }
              }
            });     
          } else {
            res.json({ Error: 'user cannot be found' })
          }
        });
      } else {
        res.json({ Error: 'no Email provided' });
      }
    };
  };
  
  login() {
    return (req, res) => {
        res.render('login');
    };
  };

  ribbit() {
    return (req, res) => {
        res.render('ribbit');
    };
  };

  _dummyGet() {
    return async (req, res) => {
      console.log(req.query);
      console.log(req.body);
      res.status(200);
      let data = await findFolderByHash(1528668515608);
      // let data = await Folder.findOne({hash: 1528664632620});
      let images = '';
      console.log(data);
      let basePath = data.path;
      data.contains.forEach((img) => {
          img.type === 'file' ? images += `<img src="${basePath}/${img.name}">` : images += `<p>${img.name}</p>`;
        });
      res.send(images);
      // connection.close()
    };
  };
};

module.exports = BasicController;
