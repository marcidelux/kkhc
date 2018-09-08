const fs = require('fs');
const path = require('path');

let indexHash = 0;
let parentHash = indexHash;

const traverse = (dir, result = []) => {
  // @ todo test & refactor
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.resolve(dir, file);

    // @ TODO in pipeline traverser -> seed -> thumbler
    if (!fullPath.endsWith('_thumb.png')) {
      let fileStats = { name: file, path: fullPath };
      indexHash += 1;

      if (fs.statSync(fullPath).isDirectory()) {
        parentHash = indexHash;
        const dirType = {
          type: 'dir',
          files: [],
          hash: indexHash,
        };
        fileStats = { ...fileStats, ...dirType };
        result.push(fileStats);
        return traverse(fullPath, fileStats.files);
      }

      const fileType = {
        type: 'file',
        hash: indexHash,
        parentHash,
        extension: path.extname(fullPath),
        tags: [],
      };
      fileStats = { ...fileStats, ...fileType };
      result.push(fileStats);
    }
  });
  return result;
};

module.exports = traverse;
