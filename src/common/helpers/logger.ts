import * as winston from 'winston';

interface MessageInfo {
  message: string;
  [key: string]: any;
}

export const logError = (error: Error, message?: string): void => {
  const msg = message ?? (error.message || error);
  const { stack } = error;

  winston.log({ level: 'error', message: `${msg}`, stack });
};

export const logInfo = (
  message: string | MessageInfo,
  extra?: object
): void => {
  if (typeof message === 'string') {
    winston.info(message, extra);

    return;
  }
  winston.info({ ...message, ...extra });
};
