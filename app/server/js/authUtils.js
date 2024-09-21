const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const allowedIPs = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];
allowedIPs.push('127.0.0.1');

function normalizeIP(req) {
    let ip = req.headers['x-forwarded-for'] || req.ip;
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    if (ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }
    return ip === '::1' ? '127.0.0.1' : ip;
}

function checkAllowedIP(req, res, next) {
    const normalizedIP = normalizeIP(req);
    const isAllowedIP = allowedIPs.includes(normalizedIP);
    console.log(`[INFO]: IP:${normalizedIP} => Allowed: ${isAllowedIP}`);

    if (isAllowedIP) {
        return next();
    }

    req.socket.destroy();
}

module.exports = { checkAllowedIP, normalizeIP };
