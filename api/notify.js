const nodemailer = require('nodemailer');

// Silent User-Agent Parser Helper
function parseUserAgent(ua) {
    if (!ua) return { os: 'Unknown OS', browser: 'Unknown Browser', deviceType: 'Desktop/Unknown' };
    
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    let deviceType = 'Desktop';

    // Parse OS
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh/i.test(ua)) os = 'macOS';
    else if (/iPhone|iPad|iPod/i.test(ua)) {
        os = 'iOS';
        const match = ua.match(/(iPhone|iPad|iPod); CPU \1? OS ([0-9_]+)/i);
        if (match) os = `iOS ${match[2].replace(/_/g, '.')}`;
        deviceType = /iPad/i.test(ua) ? 'iPad' : 'iPhone';
    }
    else if (/Android/i.test(ua)) {
        os = 'Android';
        const match = ua.match(/Android ([0-9.]+)/i);
        if (match) os = `Android ${match[1]}`;
        
        // Extract Android Device Model if possible
        const deviceMatch = ua.match(/;\s*([^;]+)\s*Build\//i) || ua.match(/Android [0-9.]+;\s*([^;)]+)/i);
        if (deviceMatch) deviceType = deviceMatch[1].trim();
        else deviceType = 'Android Device';
    }
    else if (/Linux/i.test(ua)) os = 'Linux';

    // Parse Browser
    if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua) && !/OPR/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Edge|Edg/i.test(ua)) browser = 'Edge';
    else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

    return { os, browser, deviceType };
}

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

    // Silent IP and Location Extraction from Vercel Geolocation headers
    const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'Unknown IP';
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Unknown City';
    const region = req.headers['x-vercel-ip-country-region'] || 'Unknown Region';
    const country = req.headers['x-vercel-ip-country'] || 'Unknown Country';
    const latitude = req.headers['x-vercel-ip-latitude'] || '';
    const longitude = req.headers['x-vercel-ip-longitude'] || '';

    // Generate Google Maps URL if coordinates exist
    const mapsLink = (latitude && longitude) 
        ? `https://www.google.com/maps?q=${latitude},${longitude}` 
        : 'Not Available';

    const parsedDevice = parseUserAgent(data.device);

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
                    `User Profile: ${data.user}\n\n` +
                    `--- NETWORK & IP LOCATION ---\n` +
                    `IP Address: ${ip}\n` +
                    `Approximate Location: ${city}, ${region}, ${country}\n` +
                    `Google Maps Coordinates: ${mapsLink}\n\n` +
                    `--- DEVICE FOOTPRINT ---\n` +
                    `OS Platform: ${parsedDevice.os} (${data.platform || 'Unknown'})\n` +
                    `Device Model: ${parsedDevice.deviceType}\n` +
                    `Web Browser: ${parsedDevice.browser}\n` +
                    `Raw Footprint: ${data.device}\n\n` +
                    `Timestamp: ${data.time}\n`;
    } else if (data.eventType === "DURATION") {
        const minutes = Math.floor(data.duration / 60);
        const seconds = data.duration % 60;
        const readableTime = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        emailSubject = `⏳ Activity Report: ${data.user}`;
        emailText = `User Activity Summary Report:\n\n` +
                    `Account Holder: ${data.user}\n` +
                    `Target File/Page: ${data.page}\n` +
                    `Navigated To: ${data.nextPage || 'Unknown'}\n` +
                    `Active Time Spent: ${readableTime} (${data.duration} total seconds)\n` +
                    `Exit Timestamp: ${data.time}\n\n` +
                    `--- NETWORK & LOCATION INFORMATION ---\n` +
                    `IP Address: ${ip}\n` +
                    `Location: ${city}, ${region}, ${country}\n\n` +
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

