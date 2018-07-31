const fs = require('fs');
const path = require('path');
let indexHash = 0;

const traverse = function(dir, result = []) {
  fs.readdirSync(dir).forEach(file => {
    const fPath = path.resolve(dir, file);

    // @ TODO in pipeline traverser -> seed -> thumbler
    if (!fPath.endsWith('_thumb.jpg')) {
      let fileStats = { name: file };
      indexHash += 1;

      if (fs.statSync(fPath).isDirectory()) {
        const dirType = {
          path: fPath,
          type: 'dir',
          files: [],
          hash: indexHash
        };
        fileStats = { ...fileStats, ...dirType };
        result.push(fileStats);
        return traverse(fPath, fileStats.files);
      }
      const fileExtension = path.extname(fPath);
      const fileType = {
        path: `${dir}/${indexHash}${fileExtension}`,
        type: 'file',
        hash: indexHash,
        commentFlow: false,
        extension: fileExtension,
        tags: []
      };
      fileStats = { ...fileStats, ...fileType };
      fs.renameSync(fPath, fileStats.path);
      result.push(fileStats);
    }
  });
  return result;
};

module.exports = traverse;
