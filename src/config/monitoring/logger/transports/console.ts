import * as winston from 'winston';

const { Console } = winston.transports;

interface ConsoleOptions {
  level: string,
  format: winston.Logform.Format
}

const consoleTransport = ({ level, format }: ConsoleOptions) => new Console({
  level,
  format
});

export default consoleTransport;
