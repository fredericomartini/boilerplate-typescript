import startLogger, * as logger from '@config/monitoring/logger';
import * as sinon from 'sinon';
import * as fluent from '@config/monitoring/logger/transports/fluent';
import * as SentryTransport from '@config/monitoring/logger/transports/Sentry';
import * as console from '@config/monitoring/logger/transports/console';
import * as winston from 'winston';

const { getConfig, getTransports } = logger;

const sandbox = sinon.createSandbox();

beforeEach(() => {
  sandbox.restore();
});

describe('Tests for logger config', () => {
  describe('getConfig()', () => {
    describe('Has valid options', () => {
      test('Default options', () => {
        expect(getConfig()).toEqual({
          levels: {
            error: 3,
            info: 6
          },
          colors: {
            error: 'redBG',
            info: 'green'
          },
          timestamp: {
            options: {
              format: 'YYYY-MM-DD HH:mm:ss.SSS'
            }
          },
          errors: {
            options: {
              stack: true
            }
          },
          silent: expect.any(Boolean)
        });
      });

      describe('silent', () => {
        describe('Should be "true"', () => {
          test('When process.env.TESTING === "true"', () => {
            sandbox.stub(process.env, 'TESTING').value('true');
            expect(getConfig().silent).toBeTrue();
          });
        });

        describe('Should be "false" otherwise', () => {
          test('When process.env.TESTING Boolean = false', () => {
            sandbox.stub(process.env, 'TESTING').value(false);
            expect(getConfig().silent).toBeFalse();
          });

          test('When process.env.TESTING String = "false"', () => {
            sandbox.stub(process.env, 'TESTING').value('');
            expect(getConfig().silent).toBeFalse();
          });

          test('When process.env.TESTING Empty String = ""', () => {
            sandbox.stub(process.env, 'TESTING').value('');
            expect(getConfig().silent).toBeFalse();
          });

          test('When process.env.TESTING Number = 1', () => {
            sandbox.stub(process.env, 'TESTING').value(1);
            expect(getConfig().silent).toBeFalse();
          });
        });
      });
    });
  });

  describe('getTransports()', () => {
    test('Should call getConfig()', () => {
      const spy = jest.spyOn(logger, 'getConfig');

      getTransports();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    describe('When no transports', () => {
      test('Should return an empty array', () => {
        expect(getTransports()).toBeArrayOfSize(0);
      });
    });

    describe('Console Transport', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        sandbox.stub(process, 'env').value({
          DEBUG: 'true',
          TESTING: 'false'
        });
        spy = jest.spyOn(console, 'default');
      });

      describe('Should return an array with 1 element', () => {
        test('When process.env.DEBUG === "true" && !silent', () => {
          expect(getTransports()).toBeArrayOfSize(1);
        });

        test('Should call consoleTransport()', () => {
          getTransports();
          expect(spy).toHaveBeenCalledTimes(1);
        });

        test('Level should be "info"', () => {
          getTransports();
          expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            level: 'info'
          }));
        });
      });
    });

    describe('Fluent Transport', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        sandbox.stub(process, 'env').value({
          FLUENT: 'true',
          TESTING: 'false'
        });
        spy = jest.spyOn(fluent, 'default').mockImplementation(() => {});
      });

      describe('Should return an array with 1 element', () => {
        test('When process.env.FLUENT === "true" && !silent', () => {
          expect(getConfig().silent).toBeFalse();
          expect(getTransports()).toBeArrayOfSize(1);
        });

        test('Should call fluentTransport()', () => {
          getTransports();
          expect(spy).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Sentry', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        sandbox.stub(process, 'env').value({
          SENTRY: 'true',
          TESTING: 'false'
        });
        spy = jest.spyOn(SentryTransport, 'default').mockImplementation();
      });

      describe('Should return an array with 1 element', () => {
        test('When process.env.SENTRY === "true" && !silent', () => {
          expect(getConfig().silent).toBeFalse();
          expect(getTransports()).toBeArrayOfSize(1);
        });

        test('Should call SentryTransport()', () => {
          getTransports();
          expect(spy).toHaveBeenCalledTimes(1);
        });

        test('Level Should be error', () => {
          getTransports();
          expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            level: 'error'
          }));
        });
      });
    });
  });

  describe('Default exported ', () => {
    test('Should call getConfig()', () => {
      const spy = jest.spyOn(logger, 'getConfig');

      startLogger();

      expect(spy).toHaveBeenCalled();
    });

    test('Should call getTransports()', () => {
      const spy = jest.spyOn(logger, 'getTransports');

      startLogger();

      expect(spy).toHaveBeenCalled();
    });

    test('Should call winston.configure() with expected config', () => {
      const spy = jest.spyOn(winston, 'configure');

      startLogger();

      expect(spy).toHaveBeenNthCalledWith(1, {
        exitOnError: false,
        transports: expect.any(Array),
        levels: expect.any(Object),
        silent: expect.any(Boolean)
      });
    });
  });
});
