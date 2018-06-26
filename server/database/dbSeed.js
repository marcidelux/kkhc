const traverse = require('./traverser');
const { Folder } = require('./folderModel');
const { connection } = require('./folderModel');
const mongoose = require('mongoose');

const pendingSaves = [];

const recursiveModelMaker = (model) => {
	if (model.type === 'dir') {
  	const folderContainer = model.files.map((innerFile) => {
    return { 
      name: innerFile.file,
      type: innerFile.type,
      hash: innerFile.hash,
    };
  });

  const newCollection = new Folder({ 
    name: model.file,
    path: model.path,
    contains: folderContainer,
    hash: model.hash,
  });

  console.log(newCollection)

  pendingSaves.push(newCollection.save())

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

