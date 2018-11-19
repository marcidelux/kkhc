const sharp = require('sharp');

const resize = ({ fullPath, width, outputPath }) => sharp(fullPath)
  .resize({ width })
  .toFormat('png')
  .toFile(outputPath);

module.exports = resize;
