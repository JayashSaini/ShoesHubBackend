const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: 'salted',
    product: {
      name: 'ShoesHub',
      link: 'https://youtube.com',
    },
  });

  // For more info on how mailgen content work visit https://github.com/eladnava/mailgen#readme
  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  // Generate an HTML email with the provided contents
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mail = {
    from: 'shoeshuborg@gmail.com', // We can name this anything. The mail will go to your Mailtrap inbox
    to: options.email, // receiver's mail
    subject: options.subject, // mail subject
    text: emailTextual, // mailgen content textual variant
    html: emailHtml, // mailgen content textual variant
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
    // So it's better to fail silently rather than breaking the app
    console.log(
      'Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file'
    );
    console.log('Error: ', error);
  }
};

const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: 'Welcome to Shoes Hub! Please Verify Your Email',
      action: {
        instructions:
          'To verify your email please click on the following button:',
        button: {
          color: '#191970', // Optional action button color
          text: 'Verify your email',
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};
module.exports = {
  sendEmail,
  emailVerificationMailgenContent,
};
