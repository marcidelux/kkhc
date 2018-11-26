module.exports = {
  GRAPHQL_ENDPOINT: '/graphql',
  GRAPHQL_SUBSCRIPTIONS: '/subscriptions',
  PATH_TO_DRIVE: '/opt/files',
  PATH_TO_AVATARS: '/opt/server/avatars',
  LEGACY_FOLDER: 'Legacy',
  COMPRESSED_FOLDER: '_compressed',
  THUMB_FOLDER: '_thumb',
  MINIMUM_PASSWORD_LENGTH: 6,
  ROOT_FOLDER_HASH: '0000-0000',
  DRIVE_FILES: {
    IMAGE: {
      TYPE: 'Image',
      // pretagging by years with - __SYSTEM__
      // gif should be convertedm to mp4
      // compress under 1mb ~ 5kb
      // webp
      EXTENSIONS: ['jpg', 'jpeg', 'png'],
    },
    VIDEO: {
      TYPE: 'Video',
      // convert avi AVI |> mp4
      EXTENSIONS: ['mp4'],
    },
    FOLDER: {
      TYPE: 'Folder',
    },
  },
};
