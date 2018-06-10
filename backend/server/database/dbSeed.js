const traverse = require('./traverser')
const Folder = require('./folderModel')

const recursiveModelMaker = (model) => {
	if (model.type === 'dir') {
  	const folderContainer = model.files.map((innerFile) => {
  		return { name: innerFile.file, type: innerFile.type, hash: innerFile.hash }
  	});

  const newCollection = new Folder({ 
    name: model.file,
    path: model.path,
    contains: folderContainer,
    hash: model.hash,
  });
  newCollection.save()
    .then(() => console.log('collection created -> ', newCollection));

	model.files.forEach((subModel) => {
  		recursiveModelMaker(subModel);
  	});
	}
}

const dbModel = traverse('/opt/test_images');

dbModel.forEach((model) => {
	recursiveModelMaker(model);
});