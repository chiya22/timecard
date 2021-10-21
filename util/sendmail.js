const nodemailer = require('nodemailer');

const send = (title, content) => {

    // SMTP情報
    const smtp_config = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'xxxxx',
            pass: 'xxxxx',
        },
    }

    let transporter = nodemailer.createTransport(smtp_config);

    // メール情報
    let message = {
        from: 'info@yamori.jp',
        to: 'info@yamori.jp',
        subject: title,
        text: content,
    };

    // メール送信
    transporter.sendMail(message, function (err, response) {
        if (err) {
            logger.info(`[err]${err}`);
        }
    });
}

module.exports = {
    send,
};