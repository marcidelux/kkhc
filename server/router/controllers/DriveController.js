const mongoose = require('mongoose');
const BaseController = require('./../BaseController');

class DriveController extends BaseController {
  folder() {
    return async ({ params }, res) => {
      if (params) {
        try {
          const searchedFolderObject = await this.models.Folder.findOne({ hash: params.folderHash }).exec();
          res.status(200);
          res.json(searchedFolderObject);
        } catch (error) {
          console.log(error);
        }
      }
    };
  }

  image() {
    return async ({ params }, res) => {
      if (params) {
        try {
          const searchedImageObject = await this.models.Image.findOne({ hash: params.imageHash }).exec();
          console.log(searchedImageObject);
          res.status(200).json(searchedImageObject);
        } catch (error) {
          console.log(error);
        }
      }
    };
  }

  addToCommentFlow() {
    return async ({ params: { imageHash }, body }, res) => {
      if (imageHash) {
        try {
          const commentFlow = await this.models.CommentFlow.findOne({ belongsTo: imageHash }).exec();
          const newComment = {
            id: new mongoose.mongo.ObjectId(),
            text: body.text,
            user: body.user,
            date: new Date(),
          };
          commentFlow.comments.push(newComment);
          commentFlow.markModified('comments');
          await commentFlow.save();
          res.status(200).json(commentFlow);
        } catch (error) {
          res.status(304).json({ error: 'can\'t add to CommentFlow' });
        }
      }
    };
  }

  getCommentFlow() {
    return async ({ params }, res) => {
      if (params) {
        try {
          const commentFlow = await this.models.CommentFlow.findOne({ belongsTo: params.imageHash }).exec();
          res.status(200).json(commentFlow);
        } catch (error) {
          console.log(error);
        }
      }
    };
  }

  createTag() {
    return async ({ body, params }, res) => {
      const { imageHash } = params;
      const { name, reference, originalAuthor } = body;
      try {
        const tag = new this.models.Tag({
          name,
          refersTo: [Object.assign(reference, { imageHash })],
          originalAuthor,
        });
        await tag.save();

        const image = await this.models.Image.findOne({ hash: imageHash }).exec();
        image.tags.push({ tagName: tag.name, tagId: tag._id });
        image.markModified('tags');
        await image.save();

        res.status(200).json(tag);
      } catch (error) {
        res.status(304).json({ error: 'tag is already created' });
        console.log(error);
      }
    };
  }

  insertIntoTag() {
    return async ({ body, params }, res) => {
      const { imageHash } = params;
      const { name, reference } = body;
      try {
        const existingTag = await this.models.Tag.findOne({ name }).exec();

        let unique = true;
        existingTag.refersTo.forEach((fileReference) => {
          if (fileReference.imageHash === imageHash) unique = false;
        });

        if (unique) {
          existingTag.refersTo.push(Object.assign(reference, { imageHash }));
          existingTag.markModified('refersTo');

          const image = await this.models.Image.findOne({ hash: imageHash }).exec();
          image.tags.push({
            tagName: existingTag.name,
            tagId: existingTag._id,
          });
          image.markModified('tags');

          await existingTag.save();
          await image.save();

          res.status(200).json(existingTag);
        } else {
          res.status(304).json({ error: 'image is already referenced' });
        }
      } catch (error) {
        console.log(error);
      }
    };
  }

  getSpecificTag() {
    // @TODO related tags popUp in client side
    return async ({ params: { tagId } }, res) => {
      if (tagId) {
        try {
          const tag = await this.models.Tag.findById(tagId).exec();
          res.status(200).json(tag);
        } catch (error) {
          res.status(304).json({ error: `can't find tag with id: ${tagId}` });
        }
      }
    };
  }

  getExistingTags() {
    return async (req, res) => {
      try {
        const tags = await this.models.Tag.find({}).exec();
        res.status(200).json(tags);
      } catch (error) {
        res.status(304).json({ error: 'cant\'t get the tags' });
      }
    };
  }
}

module.exports = DriveController;
