'use strict';

// const Folder = require('./../../database/folderModel').Folder;
// const connection = require('./../../database/folderModel').connection;

const findFolderByHash = require('./../../database/folderModel').findFolderByHash;
const findUserByName = require('./../../database/folderModel').findUserByName;
const User = require('./../../database/folderModel').User;

class BasicController {
  
  constructor() {};
  
  home() {
    return (req, res) => {
        res.render('home');
    };
  };
  
  addUser() {
    return (req, res) => {
      let user_ = new User({username: 'klé', password: '123', avatar: 'apád'});
      user_.save();
      res.json({msg: 'user added'});
    };
  };
  
  auth() {
    return (req, res) => {      
      if (req.body.username.length > 0) {
        findUserByName(req.body.username, err => {
          res.json({ Error: 'DB error' });
        }, user => {
          if (user) {
            if (req.body.password === user.password) {
              res.json({ Success: 'Successfully authenticated' });
            } else {
              res.json({ Error: 'wrong password' });
            }
          } else {
            res.json({ Error: 'user cannot be found' })
          }
        });
      } else {
        res.json({ Error: 'no username provided' });
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
