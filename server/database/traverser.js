const fs = require('fs');
const path = require('path');

const traverse = function(dir, result = []) {
    
    fs.readdirSync(dir).forEach((file) => {
        const fPath = path.resolve(dir, file);
        const fileStats = { name: file, path: fPath };

        if (fs.statSync(fPath).isDirectory()) {
            fileStats.type = 'dir';
            fileStats.files = [];
            fileStats.hash = Date.now()
            result.push(fileStats);
            return traverse(fPath, fileStats.files)
        }

        fileStats.type = 'file';
        fileStats.hash = Date.now()
        fileStats.commentFlow = false;
        fileStats.tags = [];
        result.push(fileStats);
    });
    return result;
};

module.exports = traverse
