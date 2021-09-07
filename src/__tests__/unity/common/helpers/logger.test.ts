import * as logger from '@helpers/logger';
import * as winston from 'winston';

const { logError, logInfo } = logger;

describe('Tests for logger', () => {
  describe('logError', () => {
    test('Should call winston.log()', () => {
      const spy = jest.spyOn(winston, 'log');

      logError(new Error('abc'));

      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('Should use message when informed', () => {
      const spy = jest.spyOn(winston, 'log');

      logError(new Error('abc'), 'my-error');

      expect(spy).toHaveBeenNthCalledWith(1, expect.objectContaining({
        message: 'my-error'
      }));
    });

    test('Should use Error message when no message', () => {
      const spy = jest.spyOn(winston, 'log');

      logError(new Error('abc'));

      expect(spy).toHaveBeenNthCalledWith(1, expect.objectContaining({
        message: 'abc'
      }));
    });

    test('Should use Error as message when no message', () => {
      const spy = jest.spyOn(winston, 'log');
      const error = new Error();

      logError(error);

      expect(spy).toHaveBeenNthCalledWith(1, expect.objectContaining({
        message: `${error}`
      }));
    });

    test('Should level to be "error" ', () => {
      const spy = jest.spyOn(winston, 'log');

      logError(new Error('abc'));

      expect(spy).toHaveBeenNthCalledWith(1, expect.objectContaining({
        level: 'error'
      }));
    });
  });

  describe('logInfo()', () => {
    test('Should call winston.info()', () => {
      const spy = jest.spyOn(winston, 'info');

      logInfo('');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    describe('When message is string', () => {
      test('Should use message', () => {
        const spy = jest.spyOn(winston, 'info');

        logInfo('my message info');

        expect(spy).toHaveBeenNthCalledWith(1, 'my message info', undefined);
      });

      test('Should use extra args', () => {
        const spy = jest.spyOn(winston, 'info');
        const extra = { teste: 123, myLog: 'abc' };

        logInfo('my message info', extra);

        expect(spy).toHaveBeenNthCalledWith(1, 'my message info', extra);
      });
    });

    describe('When message is object', () => {
      test('Should use params as object', () => {
        const spy = jest.spyOn(winston, 'info');
        const params = { message: 'my super info', myInfo: 'abc' };

        logInfo(params);

        expect(spy).toHaveBeenNthCalledWith(1, expect.objectContaining(params));
      });

      test('Should use extra args', () => {
        const spy = jest.spyOn(winston, 'info');
        const params = { message: 'my super info', myInfo: 'abc' };
        const extra = { my_super_extra_args: 'abc', teste: 'abc' };

        logInfo(params, extra);

        expect(spy).toHaveBeenNthCalledWith(1, expect.objectContaining({ ...params, ...extra }));
      });
    });
  });
});
