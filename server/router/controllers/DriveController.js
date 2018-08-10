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
      const { imageHash } = params;
      const { name, reference, originalAuthor } = body;
      try {
        const tag = new this.models.Tag({
          name,
          refersTo: [ Object.assign(reference, { imageHash }) ],
          originalAuthor
        });
        await tag.save();

        const image = await this.models.Image.findOne({ hash: imageHash }).exec();
        image.tags.push({ tagName: tag.name, tagId: tag._id });
        image.markModified('tags');
        await image.save();

        res.status(200).json(tag);
      } catch(error) {
        res.status(304).json({ error: 'tag is already created' });
        console.log(error)
      }
    }
  }

  insertIntoTag() {
    return async({ body, params }, res) => {
      const { imageHash } = params;
      const { name, reference } = body;
      try {
        const existingTag = await this.models.Tag.findOne({ name }).exec();

        let unique = true;
        existingTag.refersTo.forEach((fileReference) => fileReference.imageHash === imageHash ? unique = false : null)

        if (unique) {
          existingTag.refersTo.push(Object.assign(reference, { imageHash }));
          existingTag.markModified('refersTo');

          const image = await this.models.Image.findOne({ hash: imageHash }).exec();
          image.tags.push({ tagName: existingTag.name, tagId: existingTag._id })
          image.markModified('tags');

          await existingTag.save();
          await image.save();

          res.status(200).json(existingTag);
        } else {
          res.status(304).json({ error: 'image is already referenced' });
        }
      } catch(error) {
        console.log(error)
      }
    }
  }

  getSpecificTag() {
    // @TODO related tags popUp in client side
    return async({ params: { tagId } }, res) => {
      if (tagId) {
        try {
          const tag = await this.models.Tag.findById(tagId).exec();
          res.status(200).json(tag);
        } catch(error) {
          res.status(304).json({ error: `can\'t find tag with id: ${tagId}` });
        }
      }
    }
  }

  getExistingTags() {
    return async(req, res) => {
      try {
        const tags = await this.models.Tag.find({}).exec();
        res.status(200).json(tags);
      } catch (error) {
        res.status(304).json({ error: 'cant\'t get the tags' });
      }
    }
  }  
}

module.exports = DriveController;