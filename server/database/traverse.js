const fs = require('fs');
const path = require('path');
const {
  DRIVE_FILES: {
    FOLDER,
    IMAGE,
    VIDEO,
  },
} = require('./../constants');

let indexHash = 0;
let parentHash = indexHash;

const traverse = (dir, result = [], hashPath = [0]) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.resolve(dir, file);

    // @ TODO in pipeline traverse -> seed -> thumbler

    const fileStats = {
      name: file,
      path: fullPath,
    };

    if (fs.statSync(fullPath).isDirectory()) {
      indexHash += 1;
      parentHash = indexHash;
      const directoryType = {
        type: FOLDER.TYPE,
        files: [],
        hash: indexHash,
        hashPath: [...hashPath],
      };
      Object.assign(fileStats, directoryType);
      result.push(fileStats);
      return traverse(fullPath, fileStats.files, [...hashPath, indexHash]);
    }

    const extension = path.extname(fullPath).substring(1);
    let supportedFile;
    if (IMAGE.EXTENSIONS.includes(extension)) {
      indexHash += 1;
      supportedFile = {
        type: IMAGE.TYPE,
        hash: indexHash,
        parentHash,
        extension,
      };
    } else if (VIDEO.EXTENSIONS.includes(extension)) {
      indexHash += 1;
      supportedFile = {
        type: VIDEO.TYPE,
        hash: indexHash,
        parentHash,
        extension,
      };
    }

    if (supportedFile) {
      Object.assign(fileStats, supportedFile);
      result.push(fileStats);
    }
  });
  return result;
};

module.exports = traverse;
