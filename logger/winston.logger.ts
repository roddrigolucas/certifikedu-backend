import { createLogger, format, transports } from 'winston';

// custom log display format
// const customFormat = format.printf(({ timestamp, level, stack, message }) => {
//     return `${timestamp} - [${level.toUpperCase().padEnd(7)}] - ${stack || message}`
// })

// for development environment
const devLogger = {
  handleExceptions: true,
  format: format.combine(format.errors({ stack: true }), format.timestamp(), format.json()),
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
};

// for production environment
const prodLogger = {
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [],
};

// export log instance based on the current environment
const instanceLogger = process.env.LOCAL_DEVELOPMENT !== 'true' ? prodLogger : devLogger;

export const instance = createLogger(instanceLogger);
