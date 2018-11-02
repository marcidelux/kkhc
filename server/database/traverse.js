const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const bluebird = require('bluebird');
const uuidv4 = require('uuid/v4');
const {
  ROOT_FOLDER_HASH,
  DRIVE_FILES: {
    FOLDER,
    IMAGE,
    VIDEO,
  },
} = require('./../constants');

let indexHash = ROOT_FOLDER_HASH;
let parentHash = indexHash;

const traverse = async (dir, result = [], hashPath = [ROOT_FOLDER_HASH]) => {
  await bluebird.each(fs.readdirSync(dir), async (file) => {
    const fullPath = path.resolve(dir, file);
    const fileStats = {
      name: file,
      path: fullPath,
    };

    if (fs.statSync(fullPath).isDirectory()) {
      indexHash = uuidv4();
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

    const extension = path.extname(fullPath).substring(1).toLowerCase();
    let supportedFile;
    if (IMAGE.EXTENSIONS.includes(extension)) {
      const { width, height } = await sharp(fullPath).metadata();
      const { size } = fs.statSync(fullPath);
      indexHash = uuidv4();
      supportedFile = {
        width,
        height,
        sizeInMb: Number((size / (1024 ** 2)).toFixed(2)),
        type: IMAGE.TYPE,
        hash: indexHash,
        parentHash,
        extension,
      };
      // see and del
      console.log(file, ' ,-name--  ', supportedFile.sizeInMb, '   <-MB  | ', supportedFile.width, ' ', supportedFile.height, '  <-w-h');
    } else if (VIDEO.EXTENSIONS.includes(extension)) {
      indexHash = uuidv4();
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
