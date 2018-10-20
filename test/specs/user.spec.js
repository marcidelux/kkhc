const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const request = require('supertest');
const sendGridMail = require('@sendgrid/mail');
const RootServer = require('./../../server/RootServer');
const connectToDb = require('./../../server/database/connectToDb');
const config = require('./../../server/environmentConfig');
const generateEmailTemplate = require('./../../server/modules/generateEmailTemplate');

Object.assign(config, {
  DB_ALIAS: 'test_db',
  MONGO_PORT: '27018',
});

jest.mock('@sendgrid/mail');

describe('forgotten password mechanism', () => {
  let connection;
  let server;
  const email = 'gaga@gaga.io';
  const fakeEmail = 'chacha@cha.io';

  const unixHalfHour = 1800000;
  let originalDateFunction;
  let token;
  const fakeToken = 'gkcey5vct7e48grkyh';
  const newPassword = 'duckduck';

  beforeAll(async (done) => {
    connection = await connectToDb(config);
    server = new RootServer(1112, connection);
    server.init();
    const newUser = new connection.models.User({ email });
    await newUser.save();
    return done();
  });

  afterAll(async (done) => {
    await connection.models.User.find({ email })
      .remove()
      .exec();
    await mongoose.connection.close(true);
    server.close();
    return done();
  });

  it('forgot password should set token and timestamp', async () => {
    const req = await request(server.app)
      .put('/forgotPassword')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ email });

    const { message } = JSON.parse(req.text);
    expect(message).toBeTruthy();
    const {
      resetPasswordTokenExpires,
      resetPasswordToken,
    } = await connection.models.User.findOne({ email }).exec();
    expect(resetPasswordTokenExpires).toBeTruthy();
    expect(resetPasswordToken).toBeTruthy();
    token = resetPasswordToken;
    expect(sendGridMail.send).toHaveBeenCalledWith(
      generateEmailTemplate(email, resetPasswordToken),
    );
  });

  it('fake email should not work', async () => {
    jest.clearAllMocks();

    const req = await request(server.app)
      .put('/forgotPassword')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ email: fakeEmail });

    const { error } = JSON.parse(req.text);
    expect(error).toBeTruthy();

    expect(sendGridMail.send).not.toHaveBeenCalled();
  });

  it('fake token should not work', async () => {
    const req = await request(server.app)
      .put('/resetPassword')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ token: fakeToken, newPassword });

    const { error } = JSON.parse(req.text);
    expect(error).toBeTruthy();
  });

  it('real token after half an hour should not work', async () => {
    originalDateFunction = Date.now;
    Date.now = jest.fn(() => originalDateFunction() + unixHalfHour * 2);

    const req = await request(server.app)
      .put('/resetPassword')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ token, newPassword });

    const { error } = JSON.parse(req.text);
    expect(error).toBeTruthy();
  });

  it('reset password should work if token is valid & within timestamp', async () => {
    Date.now = originalDateFunction;

    const req = await request(server.app)
      .put('/resetPassword')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ token, newPassword });

    const { message } = JSON.parse(req.text);
    expect(message).toBeTruthy();

    const {
      resetPasswordTokenExpires,
      resetPasswordToken,
      password,
    } = await connection.models.User.findOne({ email }).exec();

    expect(resetPasswordToken).toBeNull();
    expect(resetPasswordTokenExpires).toBeNull();

    const canLoginWithNewPassword = await bcrypt.compare(newPassword, password);
    expect(canLoginWithNewPassword).toBeTruthy();
  });
});
