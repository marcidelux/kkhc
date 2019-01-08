const {
  PATH_TO_DRIVE,
  ROOT_FOLDER_HASH,
  DRIVE_FILES: {
    FOLDER,
    IMAGE,
    VIDEO,
  },
} = require('./../constants');

const populate = async (traversedDirectory, dbConnection) => {
  const pendingSaves = [];
  const {
    models: {
      CommentFlow,
      TagFlow,
      Image,
      Folder,
      Video,
    },
  } = dbConnection;
  const recursiveModelMaker = ({
    type,
    hash,
    name,
    width,
    height,
    sizeInMb,
    path,
    files,
    parentHash,
    hashPath,
    extension,
  }) => {
    if (type !== FOLDER.TYPE) {
      const newCommentFlow = new CommentFlow({
        comments: [],
        belongsTo: hash,
      });
      pendingSaves.push(newCommentFlow.save());

      const newTagFlow = new TagFlow({
        tagPrimitives: [],
        belongsTo: hash,
      });
      pendingSaves.push(newTagFlow.save());

      let newFile;
      if (type === IMAGE.TYPE) {
        newFile = new Image({
          name,
          path,
          hash,
          width,
          height,
          sizeInMb,
          extension,
          parentHash,
        });
      } else if (type === VIDEO.TYPE) {
        newFile = new Video({
          name,
          path,
          hash,
          extension,
          parentHash,
        });
      }
      console.log(`creating|> ${newFile.name}`);
      pendingSaves.push(newFile.save());
    } else if (type === FOLDER.TYPE) {
      const newFolderCollection = new Folder({
        name,
        path,
        contains: files.map(({ files: _files, ...rest }) => rest),
        hashPath,
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
    contains: traversedDirectory.map(({ files, ...rest }) => rest),
    hashPath: [],
    hash: ROOT_FOLDER_HASH,
  });

  console.log('saving ROOT');
  pendingSaves.push(ROOT.save());
  return Promise.all(pendingSaves);
};

module.exports = populate;
