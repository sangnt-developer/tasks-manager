const sgMail = require('@sendgrid/mail');

const apiKey = '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';
const apiKey2 = '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';
const apiKey3 = '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';


sgMail.setApiKey(apiKey3);

const msg = {
    to: 'sangnguyentp@mailinator.com',
    from: 'sangnguyentp@mailinator.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };
  sgMail.send(msg).then(
    (response) => { },
  (error) => { console.log(error); }
  );

// sgMail.send({
//     from: 'test@example.com',
//     to: 'ryuuroden111@gmail.com',
//     subject: 'Getting Started with SendGrid',
//     text: 'This is first email that is sent from SendGrid'
// }).then(
//     (response) => {  },
//     (error) => { console.log(error)  }
// );