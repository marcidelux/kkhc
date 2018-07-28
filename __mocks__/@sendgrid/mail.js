// mail.js
const sendGridMail = require('@sendgrid/mail');

const mockSetApiKey = jest.fn((token) => console.log(token, ' :mockToken'));
const mockSend = jest.fn((message) => {
	console.log(message, ' :mockmessage')
	return new Promise(resolve => resolve(message));
});

sendGridMail.setApiKey = mockSetApiKey;
sendGridMail.send = mockSend;

module.exports = sendGridMail;
