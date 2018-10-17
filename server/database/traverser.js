const fs = require('fs');
const path = require('path');
const CONSTANTS = require('./../constants');

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
          type: CONSTANTS.DRIVE_FILE_TYPES.FOLDER,
          files: [],
          hash: indexHash,
        };
        fileStats = { ...fileStats, ...dirType };
        result.push(fileStats);
        return traverse(fullPath, fileStats.files);
      }

      const imageType = {
        // here newwds to be converted to each file type,
        // because of contains care only if it is a folder, so after effects in mongodb dont work...
        type: CONSTANTS.DRIVE_FILE_TYPES.IMAGE,
        hash: indexHash,
        parentHash,
        extension: path.extname(fullPath),
      };
      fileStats = { ...fileStats, ...imageType };
      result.push(fileStats);
    }
  });
  return result;
};

module.exports = traverse;
