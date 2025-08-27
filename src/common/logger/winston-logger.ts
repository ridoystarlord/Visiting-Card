import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    // Console transport for real-time logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
    }),

    // logging all level
    new winston.transports.DailyRotateFile({
      filename: `logs/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m', // Max file size (20MB)
      maxFiles: '7d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // Rotate file transport for warn logs
    new winston.transports.DailyRotateFile({
      filename: `logs/warn-%DATE%.log`,
      level: 'warn',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m', // Max file size (20MB)
      maxFiles: '7d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // Rotate file transport for error logs
    new DailyRotateFile({
      filename: `logs/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD', // Daily log rotation
      level: 'error', // Only log errors
      maxSize: '20m', // Max file size (20MB)
      maxFiles: '14d', // Keep logs for 14 days
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(), // Store logs in JSON format
      ),
    }),
  ],
});
