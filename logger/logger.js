const winston = require('winston');

/**
 * An internal logger that generates a generic "genericLogs.log" logs in the app.
 */
module.exports = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'genericLogs.log' })
    ]
});
