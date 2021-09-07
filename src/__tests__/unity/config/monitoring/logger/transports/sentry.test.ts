import SentryTransport from '@config/monitoring/logger/transports/Sentry';
import * as Sentry from '@sentry/node';
import { createSandbox } from 'sinon';
import * as sinon from 'sinon';

const sandbox = createSandbox();
let spySentryInit: any;

let clock: sinon.SinonFakeTimers;

beforeEach(() => {
  sandbox.restore();
  clock = sinon.useFakeTimers();
  spySentryInit = jest.spyOn(Sentry, 'init').mockImplementation();
});

afterEach(() => {
  clock.restore();
});

describe('Sentry Transport Class tests', () => {
  describe('Construct', () => {
    beforeEach(() => {
      sandbox.stub(process, 'env').value({
        NODE_ENV: 'develop',
        REPO_NAME: 'my-repo',
        SENTRY: 'true',
        SENTRY_DSN: 'https://teste@.com/12'
      });
    });

    describe('When process.env.SENTRY !== "true"', () => {
      test('Should NOT call Sentry.init', () => {
        sandbox.stub(process.env, 'SENTRY').value('false');
        const spy = jest.spyOn(Sentry, 'init');
        const sentryTransport = new SentryTransport({});

        expect(sentryTransport).toBeDefined();

        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('When process.env.SENTRY === "true"', () => {
      describe('Should throw Error', () => {
        const errorMsg = 'Variables [ SENTRY_DSN, NODE_ENV, REPO_NAME ] are required!';

        test('When process.env.SENTRY_DSN not defined', () => {
          jest.spyOn(Sentry, 'init').mockImplementation(() => {});

          sandbox.stub(process, 'env').value({
            SENTRY: 'true',
            NODE_ENV: 'develop'
          });

          expect(() => new SentryTransport({})).toThrow(errorMsg);
        });

        test('When process.env.NODE_ENV not defined', () => {
          jest.spyOn(Sentry, 'init').mockImplementation(() => {});

          sandbox.stub(process, 'env').value({
            SENTRY: 'true',
            SENTRY_DSN: 'teste'
          });

          expect(() => new SentryTransport({})).toThrowError(errorMsg);
        });

        test('When process.env.REPO_NAME not defined', () => {
          jest.spyOn(Sentry, 'init').mockImplementation(() => {});

          sandbox.stub(process, 'env').value({
            SENTRY: 'true',
            SENTRY_DSN: 'teste',
            NODE_ENV: 'develop'
          });

          expect(() => new SentryTransport({})).toThrowError(errorMsg);
        });
      });

      describe('Sentry.init', () => {
        test('Should call Sentry.init', () => {
          const spy = jest.spyOn(Sentry, 'init');
          const sentryTransport = new SentryTransport({});

          expect(sentryTransport).toBeDefined();
          expect(spy).toHaveBeenCalled();
        });

        test('Should call with dsn = process.env.SENTRY_DSN', () => {
          const sentryTransport = new SentryTransport({});

          expect(sentryTransport).toBeDefined();
          expect(spySentryInit).toHaveBeenNthCalledWith(1, { dsn: 'https://teste@.com/12' });
        });
      });

      describe('Sentry.configureScope', () => {
        test('Should call Sentry.configureScope', () => {
          const spy = jest.spyOn(Sentry, 'configureScope');
          const sentryTransport = new SentryTransport({});

          expect(sentryTransport).toBeDefined();
          expect(spy).toHaveBeenCalled();
        });

        test('Should call setScope with scope and config', () => {
          jest.spyOn(Sentry, 'init').mockRestore();

          const spy = jest.spyOn(SentryTransport.prototype, 'setScope');

          const sentryTransport = new SentryTransport({});

          expect(sentryTransport).toBeDefined();
          expect(spy).toHaveBeenNthCalledWith(
            1,
            expect.any(Sentry.Scope),
            sentryTransport.getConfig()
          );
        });
      });

      describe('getConfig()', () => {
        let sentryTransport: SentryTransport;

        beforeAll(() => {
          sentryTransport = new SentryTransport({});
        });

        test('Should return an object with keys: [level, environment, layer, app, tag]', () => {
          expect(sentryTransport.getConfig()).toContainAllKeys(['level', 'environment', 'layer', 'app', 'tag']);
        });

        describe('level', () => {
          test('Should be empty string when not informed', () => {
            expect(sentryTransport.getConfig()).toMatchObject({
              level: ''
            });
          });

          test('Should be informed', () => {
            const level = 'my-super-level';
            const sentry = new SentryTransport({ level });

            expect(sentry.getConfig()).toMatchObject({
              level
            });
          });
        });

        describe('environment', () => {
          test('Should be process.env.NODE_ENV', () => {
            const environment = 'develop';

            sandbox.stub(process.env, 'NODE_ENV').value(environment);

            expect(sentryTransport.getConfig()).toMatchObject({
              environment
            });
          });
        });

        describe('layer', () => {
          test('Should be "backend"', () => {
            const layer = 'backend';

            expect(sentryTransport.getConfig()).toMatchObject({
              layer
            });
          });
        });

        describe('app', () => {
          test('Should be process.env.REPO_NAME', () => {
            const app = 'my-super-app';

            sandbox.stub(process.env, 'REPO_NAME').value(app);

            expect(sentryTransport.getConfig()).toMatchObject({
              app
            });
          });
        });

        describe('tag', () => {
          test('Should be {process.env.NODE_ENV}.backend.{REPO_NAME}', () => {
            const tag = 'homolog.backend.my-super-repo';

            sandbox.stub(process, 'env').value({
              NODE_ENV: 'homolog',
              REPO_NAME: 'my-super-repo'
            });

            expect(sentryTransport.getConfig()).toMatchObject({
              tag
            });
          });
        });
      });

      describe('log', () => {
        let sentryTransport: SentryTransport;

        beforeEach(() => {
          jest.spyOn(Sentry, 'captureEvent').mockImplementation();
          sentryTransport = new SentryTransport({});
        });

        test('Should call emit()', () => {
          const spy = jest.spyOn(sentryTransport, 'emit');

          sentryTransport.log({ message: 'teste' }, () => {});
          clock.tick(1000);

          expect(spy).toHaveBeenNthCalledWith(1, 'logged', { message: 'teste' });
        });

        describe('Sentry.captureEvent', () => {
          let spyConsole: jest.SpyInstance;
          let spyCaptureEvent: jest.SpyInstance;

          beforeEach(() => {
            sandbox.stub(process, 'env').value({
              SENTRY: 'true',
              SENTRY_DSN: 'dsn',
              NODE_ENV: 'develop'
            });

            spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
            spyCaptureEvent = jest.spyOn(Sentry, 'captureEvent');
          });

          describe('Should call Sentry.captureEvent() after 1 sec', () => {
            test('When no error', () => {
              sentryTransport.log({}, () => {});
              clock.tick(1000);
              expect(spyCaptureEvent).toHaveBeenCalledTimes(1);
            });

            test('With all keys [message, level, extra]', () => {
              const info = {
                message: 'my log',
                level: 'info',
                extra: {
                  my_extra_config: 'extra config'
                }
              };

              sentryTransport.log(info, () => {});
              clock.tick(1000);
              expect(spyCaptureEvent).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.any(String),
                level: expect.any(String),
                extra: expect.any(Object)
              }));
            });
          });

          describe('Should throw Error after 1 sec', () => {
            test('When some error', () => {
              const spy = jest.spyOn(Sentry, 'captureEvent').mockImplementation(() => { throw new Error(); });

              sentryTransport.log({}, () => {});
              clock.tick(1000);
              expect(spy).toHaveBeenCalled();
              expect(spyConsole).toHaveBeenNthCalledWith(1, expect.any(String), expect.any(Error));
            });
          });
        });

        describe('Should call callback', () => {
          test('After 1 sec', () => {
            jest.spyOn(Sentry, 'captureEvent').mockImplementation();
            const callback = jest.fn();

            sandbox.stub(process, 'env').value({
              SENTRY: 'true',
              SENTRY_DSN: 'dsn',
              NODE_ENV: 'develop'
            });

            sentryTransport.log({}, callback);
            clock.tick(1000);
            expect(callback).toHaveBeenCalled();
          });
        });
      });
    });
  });
});
