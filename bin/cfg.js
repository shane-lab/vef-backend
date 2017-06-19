var fs = require('fs');

let protocol = process.env.PROTOCOL || 'http';
let ip = process.env.IP || '127.0.0.1';
let port = process.env.PORT || '3000';

let expireTime = 60 * (60 * 1000); // 1 hour

let name = 'vef';

module.exports = {
    name: `${name}:server`,
    port: port,
    ip: ip,
    remoteAddress: `${protocol}://${ip}:${port}`,
    connectionString: `mongodb://127.0.0.1/${name}db`,
    api: {
        secret: fs.readFileSync(`${__dirname}/.secret`).toString('utf8'),
        expireIn: expireTime,
        expiresAt: () => {
            return (+new Date) + expireTime;
        }
    }
}