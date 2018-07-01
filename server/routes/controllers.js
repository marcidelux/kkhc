'use strict';

const {
  User,
  Folder,
  CommentFlow,
  Tag,
  findCommentFlowById,
  findFolderByHash,
  findUserByEmail,
  findTagByName,
} = require('./../database/folderModel');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class BasicController {
  
  constructor() {};

  test() {
    return (req, res) => {
      console.log(req.body);
      res.status(200);
      res.json({msg:' connect EXPO!'});
    }
  };

  folder() {
    return async ({ params }, res) => {
      if (params) {
        try {
          const searchedFolderObject = await findFolderByHash(params.folderHash)
          res.status(200);
          res.json(searchedFolderObject);
        } catch(error) {
          console.log(error)
        }

      }
    }
  }

  addFirstCommentToPicture() {
    return async ({ params, body }, res) => {
      if (params && body.fileHash) {
        try {
          const searchedFolderObject = await findFolderByHash(params.folderHash)
          let indexToSave;

          searchedFolderObject.contains.forEach((file, index) => {
            file.hash === body.fileHash && !file.commentFlow
              ? indexToSave = index
              : null
          })

          if (indexToSave) {
            const newCommentFLow = await new CommentFlow({
              comments: [{
                id: new mongoose.mongo.ObjectId(),
                text: body.text,
                user: body.user,
                date: new Date(),
              }], 
              belongsTo: searchedFolderObject.contains[indexToSave].hash,
            }).save()

          searchedFolderObject.contains[indexToSave].commentFlow = newCommentFLow._id;

          searchedFolderObject.markModified('contains');
          await searchedFolderObject.save();
          res.status(200).json({msg: "created new CommentFlow"});
          } else {
            res.status(304).send();
          }
          

        } catch(error) {
          console.log(error)

        }
      }
    }
  }

  addToCommentFlow() {
    return async ({ body, params }, res) => {
      if (params && body.text && body.user) {
        try {
          const commentFlow = await findCommentFlowById(params.commentFlowId);
          const newComment = {
            id: new mongoose.mongo.ObjectId(),
            text: body.text,
            user: body.user,
            date: new Date(),
          }
          commentFlow.comments.push(newComment);
          commentFlow.markModified('comments');
          await commentFlow.save();
          res.status(200).json({msg: "added comment to commentFLow"});

        } catch(error) {
          console.log(error)
        }
      }
    }
  }

  getCommentFlow() {
    return async({ body, params }, res) => {
      if (params) {
        try {
          const commentFlow = await findCommentFlowById(params.commentFlowId);
          res.status(200).json(commentFlow);
        } catch(error) {
          console.log(error)
        }
      }
    }
  }


  createTag() {
    return async({ body, params }, res) => {
      const { folderHash } = params;
      const { name, reference, originalAuthor } = body;
      try {
        const tag = new Tag({ name, refersTo: [ reference ], originalAuthor });
        await tag.save();

        const folder = await findFolderByHash(folderHash);

        let indexToUpdate;
        folder.contains.forEach((file, index) => {
          file.hash === reference.fileHash
            ? indexToUpdate = index
            : null
        })

        folder.contains[indexToUpdate].tags.push(tag.name)
        folder.markModified('contains');
        await folder.save();
        res.status(200).json('created');
      } catch(error) {
        console.log(error)
      }
    }
  }

  insertIntoTag() {
    return async({ body, params }, res) => {
      const { folderHash } = params;
      const { name, reference } = body;
      try {
        const existingTag = await findTagByName(name);

        let unique = true;
        existingTag.refersTo.forEach((filereference) => filereference.fileHash === reference.fileHash ? unique = false : null)

        if (unique) {
          existingTag.refersTo.push(reference);
          existingTag.markModified('refersTo');

          
          const folder = await findFolderByHash(folderHash);

          let indexToUpdate;
          folder.contains.forEach((file, index) => {
            file.hash === reference.fileHash
              ? indexToUpdate = indexToUpdate
              : null
          })

          folder.contains[indexToUpdate].tags.push(existingTag.name)
          folder.markModified('contains');

          await existingTag.save();
          await folder.save();
          res.status(200).json('created');
        } else {
          console.log('already referenced')
        }
      } catch(error) {
        console.log(error)
      }
    }
  }

  getSpecificTagsReferences() {
    return async({ body }, res) => {
      // @TODO
    }
  }

  getTags() {
    return async({ body }, res) => {
      // @TODO
    }
  }

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
          let user_ = new User({ email: 'asd@wasd.gov', password: myHash, avatar: 'SOLARIS' });
          user_.save();
          res.json({ msg: 'user added' });
        }
      });
    };
  };

  auth() {
    return async ({ body, session }, response) => {
      if (body.email) {
        try {
          const user = await findUserByEmail(body.email);
          const hash = await bcrypt.compare(body.password, user.password);

          hash
          ? session.authenticated = true && response.json({ Success: 'Successfully authenticated' })
          : response.json({ Error: 'wrong password' });

        } catch(err) {
          console.log(err);
        }
      } else {
        response.status(400).json({ Error: 'no Email provided' });
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
      res.status(200);

      let data = "";

      findUserByEmail('asd@wanksd.gov')
      .then(res => console.log(res, 'wtf'))
      .catch(err => console.log(err, 'ERRRORRRRR'));


      let basePath = data.path;

    };
  };
};

module.exports = BasicController;
