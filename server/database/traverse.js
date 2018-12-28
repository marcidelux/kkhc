const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const bluebird = require('bluebird');
const uuidv4 = require('uuid/v4');
const {
  LEGACY_FOLDER,
  THUMB_FOLDER,
  COMPRESSED_FOLDER,
  ROOT_FOLDER_HASH,
  PATH_TO_DRIVE,
  DRIVE_FILES: {
    FOLDER,
    IMAGE,
    VIDEO,
  },
} = require('./../constants');
const resize = require('./resize');

let indexHash = ROOT_FOLDER_HASH;
let parentHash = indexHash;

const traverse = async (dir, result = [], hashPath = [ROOT_FOLDER_HASH]) => {
  await bluebird.each(fs.readdirSync(dir), async (file) => {
    const fullPath = path.resolve(dir, file);
    if (fullPath.includes(LEGACY_FOLDER)) {
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
        const sizeInMb = Number((size / (1024 ** 2)).toFixed(2));
        supportedFile = {
          width,
          height,
          sizeInMb,
          type: IMAGE.TYPE,
          hash: indexHash,
          parentHash,
          extension,
        };

        console.log(`processing|> ${fullPath}`);
        await resize({
          fullPath,
          width: 128,
          outputPath: `${[PATH_TO_DRIVE, THUMB_FOLDER, indexHash].join('/')}.png`,
        });
        if (supportedFile.sizeInMb >= 0.5) {
          console.log(`resizing|> ${fullPath}`);
          await resize({
            fullPath,
            width: 500,
            outputPath: `${[PATH_TO_DRIVE, COMPRESSED_FOLDER, indexHash].join('/')}.png`,
          });
        }
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
    }
  });
  return result;
};

module.exports = traverse;
