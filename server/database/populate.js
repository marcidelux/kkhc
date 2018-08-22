const populate = async (traversedDirectory, dbConnection) => {
  const pendingSaves = [];
  const connection = dbConnection;
  const recursiveModelMaker = (model) => {
    if (model.type === 'file') {
      const newCommentFlow = new connection.models.CommentFlow({
        comments: [],
        belongsTo: model.hash,
      });
      pendingSaves.push(newCommentFlow.save());

      const newImage = new connection.models.Image({
        name: model.name,
        url: model.path,
        hash: model.hash,
        thumb: '',
        tags: [],
      });
      pendingSaves.push(newImage.save());
    }

    if (model.type === 'dir') {
      const newFolderCollection = new connection.models.Folder({
        name: model.name,
        path: model.path,
        contains: [...model.files.map(({ files, ...rest }) => rest)],
        hash: model.hash,
      });
      pendingSaves.push(newFolderCollection.save());

      model.files.forEach((subModel) => {
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
