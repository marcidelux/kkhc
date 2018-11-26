const fromShared = require('./../../shared/constants');

module.exports = {
  ...fromShared,
  SALT_ROUNDS: 10,
  UNIX_HALF_HOUR: 1800000,
  CHAT_MESSAGE_LOAD_LIMIT: 10,
  SUBSCRIPTION_TRIGGER: {
    NEW_CHAT_MESSAGE: 'NEW_CHAT_MESSAGE',
    USER_UPDATED: 'USER_UPDATED',
    NEW_COMMENT_ADDED: 'NEW_COMMENT_ADDED-',
    NEW_TAGS_ADDED: 'NEW_TAGS_ADDED-',
  },
};
