const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Handle Cross-Origin Resource Sharing (CORS) for your frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the browser's preflight check
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { user, device, platform, time } = req.body;

    // Configure the mail transporter using environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_USER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN
        }
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER, // Sends the alert right back to your inbox
        subject: `🚨 Study Engine Login: ${user}`,
        text: `Exam Tracker Dashboard Access Event!\n\n` +
              `Account Used: ${user}\n` +
              `Platform/OS: ${platform}\n` +
              `Browser Info: ${device}\n` +
              `Timestamp: ${time}\n\n` +
              `Keep this log to track potential credential sharing.`
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Alert sent' });
    } catch (error) {
        console.error('Email Dispatch Error:', error);
        return res.status(500).json({ error: 'Failed to send alert notification' });
    }
};
