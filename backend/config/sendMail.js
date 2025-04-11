import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

export const sendPasswordEmail = async (toEmail, password) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use another provider like SendGrid, Outlook, etc.
    auth: {
      user:process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your Patient Portal Password',
    html: `<p>Hello,</p>
           <p>Your account has been created successfully. Here is your password:</p>
           <h3 style="color: teal;">${password}</h3>
           <p>Please change it after logging in for security reasons.   To Change Password 
           Go to login screen , click on forgot password and enter your email id.
           You will recieve a link on your registered email to change your password!
           </p>`
  };

  await transporter.sendMail(mailOptions);
};