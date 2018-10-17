const { PubSub } = require('graphql-subscriptions');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const CONSTANTS = require('./constants');

const pubsub = new PubSub();

const resolvers = {
  FolderContent: {
    __resolveType: object => (
      CONSTANTS.DRIVE_FILE_TYPES[object.type.toUpperCase()]
        ? CONSTANTS.DRIVE_FILE_TYPES[object.type.toUpperCase()]
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
        .limit(CONSTANTS.CHAT_MESSAGE_LOAD_LIMIT)
        .exec();
      return messages.reverse();
    },
    getCommentFlow: async (_, { imageHash: belongsTo }, { db }) => (
      db.models.CommentFlow.findOne({ belongsTo }).exec()
    ),
    availableAvatars: async (_, __, { db }) => db.models.Avatar.find({}).exec(),
  },
  Mutation: {
    login: async (_, { email, password }, { db }) => {
      const user = await db.models.User.findOne({ email }).exec();
      const status = await bcrypt.compare(password, user.password);
      return status
        ? { status, userId: user.id }
        : { status };
    },
    changePassword: async (_, { userId, oldPassword, newPassword }, { db }) => {
      const user = await db.models.User.findById(userId).exec();
      const status = await bcrypt.compare(oldPassword, user.password);
      if (status) {
        user.password = await bcrypt.hash(newPassword, CONSTANTS.SALT_ROUNDS);
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
      pubsub.publish(CONSTANTS.SUBSCRIPTION_TRIGGER.USER_UPDATED, { userUpdated: user });
      return user;
    },
    addChatMessage: async (_, { chatMessage }, { db }) => {
      const newChatMessage = new db.models.ChatMessage({
        ...chatMessage,
      });
      await newChatMessage.save();
      pubsub.publish(CONSTANTS.SUBSCRIPTION_TRIGGER.NEW_CHAT_MESSAGE, { chatMessageAdded: newChatMessage });
      return newChatMessage;
    },
    addToCommentFlow: async (_, { imageHash: belongsTo, comment }, { db }) => {
      const commentFlow = await db.models.CommentFlow.findOne({ belongsTo }).exec();
      const newComment = {
        id: new mongoose.mongo.ObjectId().toString(),
        ...comment,
        date: new Date().toLocaleString('us'),
      };
      commentFlow.comments.push(newComment);
      commentFlow.markModified('comments');
      await commentFlow.save();
      pubsub.publish(CONSTANTS.SUBSCRIPTION_TRIGGER.NEW_COMMENT_ADDED + belongsTo,
        { newCommentAddedToFile: newComment });
      // @Todo this can be a lot of traffic ?
      return commentFlow;
    },
  },
  Subscription: {
    chatMessageAdded: {
      subscribe: () => pubsub.asyncIterator(CONSTANTS.SUBSCRIPTION_TRIGGER.NEW_CHAT_MESSAGE),
    },
    userUpdated: {
      subscribe: () => pubsub.asyncIterator(CONSTANTS.SUBSCRIPTION_TRIGGER.USER_UPDATED),
    },
    newCommentAddedToFile: {
      subscribe: (_, { imageHash: belongsTo }) => (
        pubsub.asyncIterator(CONSTANTS.SUBSCRIPTION_TRIGGER.NEW_COMMENT_ADDED + belongsTo)
      ),
    },
  },
};

module.exports = resolvers;
