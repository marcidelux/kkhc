const fs = require('fs');
const path = require('path');
let indexHash = 0;

const traverse = function(dir, result = []) {
    
    fs.readdirSync(dir).forEach((file) => {
        const fPath = path.resolve(dir, file);
        const fileStats = { name: file, path: fPath };
        indexHash += 1;

        if (fs.statSync(fPath).isDirectory()) {
            fileStats.type = 'dir';
            fileStats.files = [];
            fileStats.hash = indexHash;
            result.push(fileStats);
            return traverse(fPath, fileStats.files)
        }

        fileStats.type = 'file';
        fileStats.hash = indexHash;
        fileStats.commentFlow = false;
        fileStats.tags = [];
        result.push(fileStats);
    });
    return result;
};

module.exports = traverse
