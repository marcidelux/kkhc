// JÉZUSOM EZ ITT MIII ?????
// const Cat = mongoose.model('Cat', { name: String });

// const kitty = new Cat({ name: 'Zildjian' });
// kitty.save().then(() => console.log('meow'));

const dbModel = traverse('/opt/test_images')
// console.log(dbModel)

const recursiveModelMaker = (model) => {
	if (model.type === 'dir') {
  	const folderContainer = model.files.map((innerFile) => {
  		return { name: innerFile.file, type: innerFile.type }
  	})
  	console.log(folderContainer, "---------==========------------")

	// const Collection = mongoose.model(model.file, { name: String, path: String, type: String }, model.file)

	// model.files.forEach((innerFiles) => {

		const newCollection = new Folder({ name: model.file, path: model.path,  contains: folderContainer })
		newCollection.save()
		  .then(() => console.log('collection created -> ', newCollection))
	// })


	model.files.forEach((subModel) => {
  		recursiveModelMaker(subModel)
  	})
	

	



	}
}

dbModel.forEach((model) => {
	recursiveModelMaker(model)




})

// WTF ??????????????

// console.log(Folder.find({name: 'kutya'}))

// module.exports = Folder


// [ { file: 'kutya',
//     path: '/Users/caladan/WebstormProjects/kkhc/backend/test_images/kutya',
//     type: 'dir',
//     files: [ [Object], [Object], [Object] ] },
//   { file: 'majom',
//     path: '/Users/caladan/WebstormProjects/kkhc/backend/test_images/majom',
//     type: 'dir',
//     files: [ [Object], [Object], [Object] ] },
//   { file: 'vfw60-1.png',
//     path: '/Users/caladan/WebstormProjects/kkhc/backend/test_images/vfw60-1.png',
//     type: 'file' },
//   { file: 'workshop.png',
//     path: '/Users/caladan/WebstormProjects/kkhc/backend/test_images/workshop.png',
//     type: 'file' } ]