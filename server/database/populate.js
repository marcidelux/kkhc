const mongoose = require('mongoose');

const populate = async (traversedDirectory, dbConnection) => {

  const pendingSaves = [];
  const connection = dbConnection
  const recursiveModelMaker = (model) => {
    if (model.type === 'dir') {
      const newFolderCollection = new connection.models.Folder({
        name: model.name,
        path: model.path,
        contains: [
            ...model.files.map(({path, files, ...rest}) => rest)
        ],
        hash: model.hash,
      });

      console.log(newFolderCollection)

      pendingSaves.push(newFolderCollection.save())

      model.files.forEach((subModel) => {
          recursiveModelMaker(subModel);
        });
    }
  }

  traversedDirectory.forEach((model) => {
    recursiveModelMaker(model);
  });

  return Promise.all(pendingSaves).then(async () => {

  const ROOT = new connection.models.Folder({
    name: 'kkhc',
    path: '/opt/images',
    contains: [...traversedDirectory.map((folder) => {
      delete folder.files && delete folder.path
      return folder
    })],
    hash: 0,
  });

  console.log(ROOT);
  await ROOT.save();

  })
}

module.exports = populate;
