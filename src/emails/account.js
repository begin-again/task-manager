const sgMail = require('@sendgrid/mail');
const host = process.env.APP_MAIL_HOST;

sgMail.setApiKey(process.env.APP_MAIL_KEY);

function sendWelcomeMail (address, name) {
  const mail = {};
  mail.to = address;
  mail.from = host;
  mail.subject = 'Thanks for trying the Task Manager app!';
  mail.text = `Welcome  to the application, ${name}. Let me know how you get along with the app.`;
  return sgMail.send(mail);
}

function sendCancelMail (address, name) {
  const mail = {};
  mail.to = address;
  mail.from = host;
  mail.subject = 'Good-bye from Task Manager';
  mail.text = `${name}, we're sorry to see you go.`;
  return sgMail.send(mail);
}

module.exports = {
  sendWelcomeMail,
  sendCancelMail
};
