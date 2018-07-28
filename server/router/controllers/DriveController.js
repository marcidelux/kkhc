'use strict';

const mongoose = require('mongoose');
const BaseController = require('./../BaseController');

class DriveController extends BaseController {
  
  constructor(dbConnection) {
    super(dbConnection);
  };

  folder() {
    return async ({ params }, res) => {
      if (params) {
        try {
          const searchedFolderObject = await this.models.Folder.findOne({ hash: params.folderHash }).exec();
          res.status(200);
          res.json(searchedFolderObject);
        } catch(error) {
          console.log(error)
        }

      }
    }
  }

  image() {
    return async ({params, body}, res) => {
      if (params) {
        try {
          const searchedImageObject = await this.models.Image.findOne({hash: params.imageHash}).exec();
          console.log(searchedImageObject);
          res.status(200).json(searchedImageObject);
        } catch(error) {
          console.log(error)
        }
      }

    }
  }

  addToCommentFlow() {
    return async ({ params, body }, res) => {
      const paramsParsed = JSON.parse(params.hashes)
      if (paramsParsed.folderHash && paramsParsed.imageHash) {
        try {
          const searchedFolderObject = await this.models.Folder.findOne({ hash: paramsParsed.folderHash }).exec();
          let indexToSave = -1;

          searchedFolderObject.contains.forEach((file, index) => {
            file.hash === paramsParsed.imageHash
              ? indexToSave = index
              : null
          })

          const commentFlow = await this.models.CommentFlow.findById(paramsParsed.commentFlowHash).exec();

          if (indexToSave > -1) {
            const newComment = {
              id: new mongoose.mongo.ObjectId(),
              text: body.text,
              user: body.user,
              date: new Date(),
            }
            commentFlow.comments.push(newComment);
            commentFlow.markModified('comments');
            await commentFlow.save();

            const searchedImage = await this.models.Image.findOne({ hash: paramsParsed.imageHash }).exec();
            searchedImage.commentFlow = commentFlow._id;
            searchedImage.markModified('commentFlow');
            await searchedImage.save();

            searchedFolderObject.contains[indexToSave].commentFlow = commentFlow._id;
            searchedFolderObject.markModified('contains');
            await searchedFolderObject.save();
            res.status(200).json(commentFlow);
          } else {
            res.status(304).send();
          }

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
          const commentFlow = await this.models.CommentFlow.findById(params.commentFlowId).exec();
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
        const tag = new this.models.Tag({ name, refersTo: [ reference ], originalAuthor });
        await tag.save();

        const folder = await this.models.Folder.findOne({ hash: folderHash }).exec();

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
        const existingTag = await Tag.findOne({ name }).exec();

        let unique = true;
        existingTag.refersTo.forEach((filereference) => filereference.fileHash === reference.fileHash ? unique = false : null)

        if (unique) {
          existingTag.refersTo.push(reference);
          existingTag.markModified('refersTo');

          
          const folder = await this.models.Folder.findOne({ hash: folderHash }).exec();

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
}

module.exports = DriveController;