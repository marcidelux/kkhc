const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// eslint-disable-next-line
const checkIfInteger = n => n > 0 && Number.isInteger(n)
  ? n
  : null;

const extractParams = ({ query }) => ({
  width: checkIfInteger(Number(query.width)),
  height: checkIfInteger(Number(query.height)),
});

function resize(request, response, next) {
  const { _parsedUrl: { pathname } } = request;
  const extension = path
    .extname(pathname)
    .toLowerCase()
    .substring(1);
  const formats = ['jpg', 'jpeg', 'png'];
  const { width, height } = extractParams(request);

  if ((width || height) && formats.includes(extension)) {
    try {
      fs.accessSync(pathname);
      response.writeHead(200, { 'Content-Type': `image/${extension}` });
      return sharp(pathname)
        .resize(width, height)
        .pipe(response);
    } catch (error) {
      console.log(error);
      return response.sendStatus(404);
    }
  } else {
    return next();
  }
}

module.exports = resize;
