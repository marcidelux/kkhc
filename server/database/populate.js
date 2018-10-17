const CONSTANTS = require('./../constants');

const populate = async (traversedDirectory, dbConnection) => {
  const pendingSaves = [];
  const connection = dbConnection;
  const recursiveModelMaker = ({
    type,
    hash,
    name,
    path,
    files,
    parentHash,
    extension,
  }) => {
    if (type === CONSTANTS.DRIVE_FILE_TYPES.IMAGE) {
      const newCommentFlow = new connection.models.CommentFlow({
        comments: [],
        belongsTo: hash,
      });
      pendingSaves.push(newCommentFlow.save());

      const newImage = new connection.models.Image({
        name,
        path,
        hash,
        extension,
        parentHash,
      });
      pendingSaves.push(newImage.save());
    }

    if (type === CONSTANTS.DRIVE_FILE_TYPES.FOLDER) {
      const newFolderCollection = new connection.models.Folder({
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

  return Promise.all(pendingSaves).then(async () => {
    const ROOT = new connection.models.Folder({
      name: 'kkhc',
      path: '/opt/images',
      contains: [...traversedDirectory.map(({ files, ...rest }) => rest)],
      hash: 0,
    });
    await ROOT.save();
  });
};

module.exports = populate;
