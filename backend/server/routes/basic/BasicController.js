'use strict';

const Folder = require('./../../database/folderModel');

class BasicController {
  
  constructor() {};
  
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

  _dummyGet() {
    return async (req, res) => {
      console.log(req.query);
      console.log(req.body);
      res.status(200);
      let data = await Folder.findOne({hash: 1528649288838});
      let images = '';
      console.log(data);
      let basePath = data.path;
      data.contains.forEach((img) => {
          img.type === 'file' ? images += `<img src="${basePath}/${img.name}">` : images += `<p>${img.name}</p>`;
        });
      res.send(images);
    };
  };

};

module.exports = BasicController;
