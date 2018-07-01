const traverse = require('./traverser');
const { Folder } = require('./folderModel');
const { connection } = require('./folderModel');

const pendingSaves = [];

const recursiveModelMaker = (model) => {
	if (model.type === 'dir') {

  const newFolderCollection = new Folder({ 
    name: model.name,
    path: model.path,
    contains: [
        ...model.files.map(({path, ...rest}) => rest )
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

const rootFolders = traverse('/opt/images');
rootFolders.forEach((model) => {
	recursiveModelMaker(model);
});

Promise.all(pendingSaves).then(async () => {

  const ROOT = new Folder({
    name: 'kkhc',
    path: '/opt/images',
    contains: [...rootFolders.map((folder) => {
      delete folder.files && delete folder.path
      return folder
    })],
    hash: 0,
  });

  console.log(ROOT);
  await ROOT.save()

  connection.close()
})

