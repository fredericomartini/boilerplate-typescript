import * as Sentry from '@sentry/node';
import * as Transport from 'winston-transport';

type keyValue = { [key: string]: string; }

interface IConfig extends keyValue {
  level: string;
  environment: string;
  layer: string;
  app: string;
  tag: string;
}

export class SentryTransport extends Transport {
  opts: Transport.TransportStreamOptions;

  constructor(opts: Transport.TransportStreamOptions) {
    super(opts);
    this.opts = opts;

    if (process.env.SENTRY !== 'true') {
      return;
    }

    if (!process.env.SENTRY_DSN || !process.env.NODE_ENV || !process.env.REPO_NAME) {
      throw new Error('Variables [ SENTRY_DSN, NODE_ENV, REPO_NAME ] are required!');
    }

    Sentry.init({ dsn: process.env.SENTRY_DSN });

    Sentry.configureScope((scope) => this.setScope(scope, this.getConfig()));
  }

  getConfig(): IConfig {
    return {
      level: this.opts.level ?? '',
      environment: process.env.NODE_ENV!,
      layer: 'backend',
      app: process.env.REPO_NAME!,
      tag: `${process.env.NODE_ENV}.backend.${process.env.REPO_NAME}`
    };
  }

  setScope(scope: Sentry.Scope, config: IConfig) {
    scope.setTags(config);
  }

  log(info: any, callback: Function) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    setTimeout(() => {
      try {
        const { message, level, ...extra } = info;

        Sentry.captureEvent({
          message,
          level,
          extra
        });
      } catch (err) {
        // eslint-disable-next-line
          console.error("Erro: Log não foi enviado para Sentry", err);
      } finally {
        callback();
      }
    }, 1000);
  }
}

export default SentryTransport;
