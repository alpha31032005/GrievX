const winston = require('winston');
const config = require('../config/env');

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'smart-civic-backend' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),

    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

module.exports = logger;
