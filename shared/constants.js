module.exports = {
  GRAPHQL_ENDPOINT: '/graphql',
  GRAPHQL_SUBSCRIPTIONS: '/subscriptions',
  PATH_TO_DRIVE: '/opt/files',
  PATH_TO_AVATARS: '/opt/server/avatars',
  MINIMUM_PASSWORD_LENGTH: 6,
  DRIVE_FILES: {
    IMAGE: {
      TYPE: 'Image',
      EXTENSIONS: ['png'],
    },
    VIDEO: {
      TYPE: 'Video',
      EXTENSIONS: ['avi', 'mp4'],
    },
    FOLDER: {
      TYPE: 'Folder',
    },
  },
};
