const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');
const { PATH_TO_AVATARS } = require('./../constants');

class AvatarMapper {
  constructor(dbConnection, pathToAvatars) {
    this.pathToSeed = pathToAvatars;
    this.dbConnection = dbConnection;
  }

  static renameFileToUuid(from, to) {
    fs.renameSync(from, to);
  }

  async saveAvatarsToDb() {
    const uuidsOfExistingAvatars = (await this.findAllAvatarsInDb()).map(({ nameOnDisc }) => nameOnDisc);
    const avatarImageInfos = [];

    this.loadAvatarsFromLocalDirectory().forEach((fileNameWithExtension) => {
      const baseName = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf('.'));
      if (!uuidsOfExistingAvatars.includes(baseName)) {
        const fullPath = path.resolve(this.pathToSeed, fileNameWithExtension);
        const extension = path.extname(fullPath);
        const nameOnDisc = uuidv4();
        avatarImageInfos.push({
          nameOnDisc,
          extension,
        });
        AvatarMapper.renameFileToUuid(fullPath, path.resolve(this.pathToSeed, nameOnDisc + extension));
      }
    });

    return this.dbConnection.models.Avatar.insertMany(avatarImageInfos);
  }

  loadAvatarsFromLocalDirectory() {
    return fs.readdirSync(this.pathToSeed);
  }

  async findAllAvatarsInDb() {
    return this.dbConnection.models.Avatar.find({}).exec();
  }

  async addNewAvatarFromRemote(fileObj) {
    const nameOnDisc = uuidv4();
    const extension = '.png';
    const newAvatar = new this.dbConnection.models.Avatar({ nameOnDisc, extension });
    await fileObj.mv(path.join(PATH_TO_AVATARS, nameOnDisc + extension));
    return newAvatar.save();
  }
}

module.exports = AvatarMapper;
