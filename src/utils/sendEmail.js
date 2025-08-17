const nodemailer = require("nodemailer");
const {senderEmail,emailPassword} = require("../config/kyes");

const sendEmail = async({emailTo, subject,code,content}) =>{
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        service: process.env.SMPT_SERVICE,// true for 465, false for other ports
        auth: {
            user: senderEmail, // generated ethereal user
            pass:  emailPassword, // generated ethereal password
        },
    });

    const message = {
        from: process.env.SMPT_MAIL,
        to: emailTo,
        subject,
        html: `
            <div>
                <h3>Use this bellow code to ${content}</h3>
                <p><strong>Code: </strong>${code}</p>
            </div>
        `,
    };
    await transporter.sendMail(message);
}

module.exports = sendEmail;