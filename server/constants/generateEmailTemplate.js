const generateEmailTemplate = (email, token) => ({
  to: email,
  from: {
    name: 'AZUCAR',
    email: 'kkhcInitiative@yoloCity.com',
  },
  subject: 'kkhc | request password change',
  html: `<a href="http://localhost:3099/resetPasswordView?token=${token}">jolo</a>`,
  // attachments: [{ filename: 'a', content: 'asdasd' }],
});

module.exports = generateEmailTemplate;
