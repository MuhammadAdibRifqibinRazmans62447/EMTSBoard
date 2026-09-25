const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    pool: true,

    host: process.env.SMTP_HOST,

    port: Number(process.env.SMTP_PORT),

    secure: false,

    tls: {
        rejectUnauthorized: false
    }

});


const sendEmail =  async({to,subject,html})=>{

    try{
        const info = await transporter.sendMail({

            from : process.env.SMTP_FROM,
            to,
            subject,
            html


        });

        console.log('Email sent:', info.messageId);

        return info;


    }catch(error){

        console.error('Email failed:', error);

        throw error;


    }


}


module.exports = {
    sendEmail
};