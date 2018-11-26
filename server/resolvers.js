const { PubSub } = require('graphql-subscriptions');
const bcrypt = require('bcrypt');
const bluebird = require('bluebird');
const mongoose = require('mongoose');
const {
  DRIVE_FILES,
  CHAT_MESSAGE_LOAD_LIMIT,
  SALT_ROUNDS,
  SUBSCRIPTION_TRIGGER: {
    USER_UPDATED,
    NEW_CHAT_MESSAGE,
    NEW_COMMENT_ADDED,
    NEW_TAGS_ADDED,
  },
} = require('./constants');

const pubsub = new PubSub();

const resolvers = {
  FolderContent: {
    __resolveType: object => (
      DRIVE_FILES[object.type.toUpperCase()]
        ? DRIVE_FILES[object.type.toUpperCase()].TYPE
        : null
    ),
  },
  Query: {
    getFolderContent: async (_, { hash }, { db }) => db.models.Folder.findOne({ hash }).exec(),
    getImage: async (_, { hash }, { db }) => db.models.Image.findOne({ hash }).exec(),
    usersStatus: async (_, __, { db }) => {
      const usersStatus = await db.models.User.find({}).exec();
      return usersStatus;
    },
    getChatMessages: async (_, { offset }, { db }) => {
      const messages = await db.models.ChatMessage.find({})
        .sort({ _id: -1 })
        .skip(offset)
        .limit(CHAT_MESSAGE_LOAD_LIMIT)
        .exec();
      return messages.reverse();
    },
    getCommentFlow: async (_, { fileHash: belongsTo }, { db }) => (
      db.models.CommentFlow.findOne({ belongsTo }).exec()
    ),
    getTagFlow: async (_, { fileHash: belongsTo }, { db }) => (
      db.models.TagFlow.findOne({ belongsTo }).exec()
    ),
    availableAvatars: async (_, __, { db }) => db.models.Avatar.find({}).exec(),
    availableTags: async (_, __, { db }) => db.models.Tag.find({}).exec(),
    getTagContent: async (_, { tagName: name }, { db }) => {
      const tag = await db.models.Tag.findOne({ name }).exec();
      if (tag) {
        return Promise
          .all(tag.fileReferences
            .map(({ hash, type }) => db.models[type].findOne({ hash }).exec()));
      }
    },
  },
  Mutation: {
    login: async (_, { email, password }, { db }) => {
      const user = await db.models.User.findOne({ email }).exec();
      if (user) {
        const status = await bcrypt.compare(password, user.password);
        return status
          ? { status, userId: user.id }
          : { status };
      }
      return { status: false };
    },
    changePassword: async (_, { userId, oldPassword, newPassword }, { db }) => {
      const user = await db.models.User.findById(userId).exec();
      const status = await bcrypt.compare(oldPassword, user.password);
      if (status) {
        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.save();
        return true;
      }
      return false;
    },
    updateStatus: async (_, { user: { id, ...rest } }, { db }) => {
      const user = await db.models.User.findById(id).exec();
      Object.entries(rest).forEach(([key, value]) => {
        if (user[key] !== value) {
          user[key] = value;
        }
      });
      await user.save();
      pubsub.publish(USER_UPDATED, { userUpdated: user });
      return user;
    },
    addChatMessage: async (_, { chatMessage }, { db }) => {
      const newChatMessage = new db.models.ChatMessage({
        ...chatMessage,
      });
      await newChatMessage.save();
      pubsub.publish(NEW_CHAT_MESSAGE, { chatMessageAdded: newChatMessage });
      return newChatMessage;
    },
    updateCommentFlow: async (_, { fileHash: belongsTo, comment }, { db }) => {
      const commentFlow = await db.models.CommentFlow.findOne({ belongsTo }).exec();
      const newComment = {
        id: new mongoose.mongo.ObjectId().toString(),
        ...comment,
        date: new Date().toLocaleString('us'),
      };
      commentFlow.comments.push(newComment);
      commentFlow.markModified('comments');
      await commentFlow.save();
      pubsub.publish(NEW_COMMENT_ADDED + belongsTo, { newCommentAddedToFile: newComment });
      return commentFlow;
    },
    updateTagFlow: async (_, { fileLookup: { hash: belongsTo, type }, tags, userId }, { db }) => {
      const tagFlow = await db.models.TagFlow.findOne({ belongsTo }).exec();
      const tagNames = tagFlow.tagPrimitives.map(t => t.name);
      const broadcast = [];

      await bluebird.each(Array.from(new Set(tags)).reverse(), async (name) => {
        if (!tagNames.includes(name)) {
          const tagPrimitive = { name, userId };
          const existingTag = await db.models.Tag.findOne({ name }).exec();
          let newTag;
          if (existingTag) {
            existingTag.fileReferences.unshift({
              hash: belongsTo,
              type,
            });
          } else {
            // publish new Tag created !
            newTag = new db.models.Tag({
              name,
              fileReferences: [{
                hash: belongsTo,
                type,
              }],
              userId,
            });
          }
          tagFlow.tagPrimitives.unshift(tagPrimitive);
          broadcast.unshift(tagPrimitive);
          await Promise.all([
            ...(existingTag ? [existingTag.save()] : [newTag.save()]),
            tagFlow.save(),
          ]);
        }
      });
      if (broadcast.length > 0) {
        pubsub.publish(NEW_TAGS_ADDED + belongsTo, { newTagsAddedToFile: broadcast });
      }
      return tagFlow;
    },
  },
  Subscription: {
    chatMessageAdded: {
      subscribe: () => pubsub.asyncIterator(NEW_CHAT_MESSAGE),
    },
    userUpdated: {
      subscribe: () => pubsub.asyncIterator(USER_UPDATED),
    },
    newCommentAddedToFile: {
      subscribe: (_, { fileHash: belongsTo }) => (
        pubsub.asyncIterator(NEW_COMMENT_ADDED + belongsTo)
      ),
    },
    newTagsAddedToFile: {
      subscribe: (_, { fileHash: belongsTo }) => (
        pubsub.asyncIterator(NEW_TAGS_ADDED + belongsTo)
      ),
    },
  },
};

module.exports = resolvers;
