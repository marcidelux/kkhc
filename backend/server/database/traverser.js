const fs = require('fs');
const path = require('path');
// const util = require('util');

const traverse = function(dir, result = []) {


    // list files in directory and loop through
    fs.readdirSync(dir).forEach((file) => {


        // builds full path of file
        const fPath = path.resolve(dir, file);

        // prepare stats obj
        const fileStats = { file, path: fPath };

        // is the file a directory ? 
        // if yes, traverse it also, if no just add it to the result
        if (fs.statSync(fPath).isDirectory()) {
            fileStats.type = 'dir';
            fileStats.files = [];
            result.push(fileStats);
            return traverse(fPath, fileStats.files)
        }

        fileStats.type = 'file';
        result.push(fileStats);
    });
    return result;
};

module.exports = traverse

// console.log(traverse('./../../test_images'))

// console.log(util.inspect(traverse(process.argv[2]), false, null));