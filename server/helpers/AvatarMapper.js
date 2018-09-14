const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');
const config = require('./../envConfig');

class AvatarMapper {
  constructor(dbConnection) {
    this.pathToSeed = config.PATH_TO_AVATARS;
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
    const newAvatar = new this.dbConnection.models.Avatar({ nameOnDisc, extension: '.png' });
    await fileObj.mv(path.join(config.PATH_TO_AVATARS, nameOnDisc+ '.png'));
    return newAvatar.save()
  }
}

module.exports = AvatarMapper;
