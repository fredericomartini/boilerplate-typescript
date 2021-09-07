import * as winston from 'winston';
import consoleTransport from './transports/console';
import fluentTransport from './transports/fluent';
import SentryTransport from './transports/Sentry';

interface LoggerConfig {
  levels: {
    error: number
    info: number
  }
  colors: {
    error: string
    info: string
  },
  timestamp: winston.Logform.Format,
  errors: winston.Logform.Format,
  silent: boolean
}

export const getConfig = () => ({
  levels: {
    error: 3,
    info: 6
  },
  colors: {
    error: 'redBG',
    info: 'green'
  },
  timestamp: winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors: winston.format.errors({ stack: true }),
  silent: process.env.TESTING === 'true'
} as LoggerConfig);

export const getTransports = () => {
  const { DEBUG, FLUENT, SENTRY } = process.env;
  const transports = [];
  const { silent, timestamp, errors } = getConfig();

  if (DEBUG === 'true' && !silent) {
    transports.push(consoleTransport({
      level: 'info',
      format: winston.format.combine(
        timestamp,
        errors,
        winston.format.colorize(),
        winston.format.simple()
      )
    }));
  }

  if (FLUENT === 'true' && !silent) {
    transports.push(fluentTransport());
  }

  if (SENTRY === 'true' && !silent) {
    transports.push(new SentryTransport({
      level: 'error',
      handleExceptions: true,
      format: winston.format.combine(
        timestamp,
        errors,
        winston.format.json()
      )
    }));
  }

  return transports;
};

export default () => {
  const { levels, silent, colors } = getConfig();

  winston.configure({
    exitOnError: false,
    transports: getTransports(),
    levels,
    silent
  });

  winston.addColors(colors);
};
