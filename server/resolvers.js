const { PubSub } = require('graphql-subscriptions');
const bcrypt = require('bcrypt');
const CONSTANTS = require('./constants');

const CHAT_MESSAGE_LOAD_LIMIT = 10;

const pubsub = new PubSub();
const NEW_CHAT_MESSAGE = 'NEW_CHAT_MESSAGE';
const USER_UPDATED = 'USER_UPDATED';

const resolvers = {
  Query: {
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
  },
  Subscription: {
    chatMessageAdded: {
      subscribe: () => pubsub.asyncIterator(NEW_CHAT_MESSAGE),
    },
    userUpdated: {
      subscribe: () => pubsub.asyncIterator(USER_UPDATED),
    },
  },
};

module.exports = resolvers;
