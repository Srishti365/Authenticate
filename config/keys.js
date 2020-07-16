const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: { 
        user: 'projectrasoise@gmail.com',
        pass: 'r00t1234'
    }
});


module.exports = transporter;