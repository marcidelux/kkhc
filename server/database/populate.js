const {
  DRIVE_FILE_TYPES: {
    FOLDER,
    IMAGE,
  },
} = require('./../constants');
const {
  PATH_TO_DRIVE,
} = require('./../environmentConfig');

const populate = async (traversedDirectory, dbConnection) => {
  const pendingSaves = [];
  const {
    models: {
      CommentFlow,
      TagFlow,
      Image,
      Folder,
    },
  } = dbConnection;
  const recursiveModelMaker = ({
    type,
    hash,
    name,
    path,
    files,
    parentHash,
    extension,
  }) => {
    if (type === IMAGE) {
      const newCommentFlow = new CommentFlow({
        comments: [],
        belongsTo: hash,
      });
      pendingSaves.push(newCommentFlow.save());

      const newTagFlow = new TagFlow({
        tagNames: [],
        belongsTo: hash,
      });
      pendingSaves.push(newTagFlow.save());

      const newImage = new Image({
        name,
        path,
        hash,
        extension,
        parentHash,
      });
      pendingSaves.push(newImage.save());
    }

    if (type === FOLDER) {
      const newFolderCollection = new Folder({
        name,
        path,
        contains: [...files.map(({ files: _files, ...rest }) => rest)],
        hash,
      });
      pendingSaves.push(newFolderCollection.save());

      files.forEach((subModel) => {
        recursiveModelMaker(subModel);
      });
    }
  };

  traversedDirectory.forEach((model) => {
    recursiveModelMaker(model);
  });

  const ROOT = new Folder({
    name: 'kkhc',
    path: PATH_TO_DRIVE,
    contains: [...traversedDirectory.map(({ files, ...rest }) => rest)],
    hash: 0,
  });

  pendingSaves.push(ROOT.save());
  return Promise.all(pendingSaves);
};

module.exports = populate;
