const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendOrderCompletionEmail = (clientEmail, orderDetails) => {
    
    const mailOptions = {
    from: `McDowell's Orders<${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: "McDowell's Order Completed",
    text: orderDetails
    };

    
    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log('Error:', error);
    } else {
        console.log('Email sent:', info.response);
    }
    })
}

module.exports = { sendOrderCompletionEmail };