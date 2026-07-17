const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const data = req.body;

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

    let emailSubject = '';
    let emailText = '';

    // Route email content based on event type
    if (data.eventType === "LOGIN") {
        emailSubject = `🚨 War-Room Entry: ${data.user}`;
        emailText = `Authentication Gateway Access Granted!\n\n` +
                    `User Profile: ${data.user}\n` +
                    `Platform/OS: ${data.platform}\n` +
                    `Browser Footprint: ${data.device}\n` +
                    `Timestamp: ${data.time}\n`;
    } else if (data.eventType === "DURATION") {
        // Convert seconds to readable minutes/seconds format
        const minutes = Math.floor(data.duration / 60);
        const seconds = data.duration % 60;
        const readableTime = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        emailSubject = `⏳ Activity Report: ${data.user}`;
        emailText = `User Activity Summary Report:\n\n` +
                    `Account Holder: ${data.user}\n` +
                    `Target File/Page: ${data.page}\n` +
                    `Active Time Spent: ${readableTime} (${data.duration} total seconds)\n` +
                    `Exit Timestamp: ${data.time}\n\n` +
                    `Note: High duration logs indicate heavy copying or intensive review of your generated materials.`;
    } else {
        return res.status(400).json({ error: 'Unknown Event Type' });
    }

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: emailSubject,
        text: emailText
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Security alert dispatched' });
    } catch (error) {
        console.error('Nodemailer pipeline exception:', error);
        return res.status(500).json({ error: 'Failed to complete server alert loop' });
    }
};
