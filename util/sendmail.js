const log4js = require('log4js');
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const nodemailer = require('nodemailer');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const send = (title, content) => {

  // SMTP情報
  // const smtp_config = {
  //     host: process.env.MAIL_HOST,
  //     port: process.env.MAIL_PORT,
  //     secure: true,
  //     auth: {
  //         user: process.env.MAIL_USER,
  //         pass: process.env.MAIL_PASS,
  //     },
  // }

  // 認証情報
  const auth = {
    type         : 'OAuth2',
    user         : process.env.MAIL_USER,
    clientId     : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    refreshToken : process.env.REFRESH_TOKEN
  };

  // トランスポート
  const smtp_config = {
    service : 'gmail',
    auth    : auth
  };    

  const transporter = nodemailer.createTransport(smtp_config);

  // メール情報
  const message = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject: title,
    text: content,
  };

  // メール送信
  transporter.sendMail(message, (err) => {
    if (err) {
      logger.info(`[err]${err}`);
    }
  });
};

module.exports = {
  send,
};