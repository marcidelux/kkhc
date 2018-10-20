const bcrypt = require('bcrypt');
const Promise = require('bluebird');
const crypto = Promise.promisifyAll(require('crypto'));
const sendGridMail = require('@sendgrid/mail');

const CONSTANTS = require('./../../constants');
const generateEmailTemplate = require('./../../modules/generateEmailTemplate');
const config = require('./../../environmentConfig');

const BaseController = require('./../BaseController');

class UserController extends BaseController {
  constructor(dbConnection) {
    super(dbConnection);

    this.utilities = {
      generateToken: n => crypto.randomBytesAsync(n)
        .then(buffer => buffer.toString('hex')),

      sendEmail: async (email, token) => {
        sendGridMail.setApiKey(config.SENDGRID_API);
        return sendGridMail.send(generateEmailTemplate(email, token));
      },
    };
  }

  forgotPassword() {
    return async ({ body: { email } }, res) => {
      if (email) {
        try {
          const searchedUser = await this.models.User.findOne({ email }).exec();

          if (searchedUser) {
            const token = await this.utilities.generateToken(32);
            searchedUser.resetPasswordToken = token;
            searchedUser.resetPasswordTokenExpires = Date.now() + CONSTANTS.UNIX_HALF_HOUR;
            await searchedUser.save();
            await this.utilities.sendEmail(email, token);
            res.status(200).json({ message: `send link to email: ${email}` });
          } else {
            res.status(200).json({ error: `unable to generate link to ${email}` });
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
  }

  resetPassword() {
    return async ({ body: { token, newPassword } }, res) => {
      if (token && newPassword.length >= CONSTANTS.MINIMUM_PASSWORD_LENGTH) {
        try {
          const searchedUser = await this.models.User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpires: { $gt: Date.now() },
          }).exec();
          if (searchedUser) {
            const hash = await bcrypt.hash(newPassword, CONSTANTS.SALT_ROUNDS);
            searchedUser.password = hash;
            searchedUser.resetPasswordToken = null;
            searchedUser.resetPasswordTokenExpires = null;
            await searchedUser.save();
            res.status(200).json({ message: 'password have been reseted' });
          } else {
            res.status(200).json({ error: 'token have been expired' });
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
  }
}

module.exports = UserController;
