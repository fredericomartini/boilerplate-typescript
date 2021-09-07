/* eslint-disable no-underscore-dangle */

import * as ErrorHandler from '@middlewares/errorHandler';
import CustomException from '@helpers/error/CustomException';
import { NextFunction, Response } from 'express';
import { MockResponse, createResponse } from 'node-mocks-http';
import * as logger from '@helpers/logger';

const { errorHandler, isSQLError } = ErrorHandler;

describe('Tests for middleware errorHandler', () => {
  describe('isSQLError()', () => {
    describe('Should return true', () => {
      test('When Error message has "select"', () => {
        expect(isSQLError('My message select')).toBeTrue();
      });

      test('When Error message has "insert"', () => {
        expect(isSQLError('My message INSERT')).toBeTrue();
      });

      test('When Error message has "delete"', () => {
        expect(isSQLError('My message delete')).toBeTrue();
      });

      test('When Error message has "update"', () => {
        expect(isSQLError('My message update')).toBeTrue();
      });

      test('When Error message has "drop"', () => {
        expect(isSQLError('My message drop')).toBeTrue();
      });

      test('When Error message has "limit"', () => {
        expect(isSQLError('My message limit')).toBeTrue();
      });

      test('When Error message has "where"', () => {
        expect(isSQLError('My message where')).toBeTrue();
      });
    });

    describe('Should return false', () => {
      test('When message has no sql commands', () => {
        expect(isSQLError('My message abc')).toBeFalse();
        expect(isSQLError('')).toBeFalse();
      });
    });
  });

  describe('default exported errorHandler()', () => {
    let res: MockResponse<Response>;
    let next: NextFunction;

    beforeEach(() => {
      res = createResponse();
      next = jest.fn();
    });

    describe('When Error is instance of CustomException', () => {
      test('Should call parseBodyCustomException() with error', () => {
        const spy = jest.spyOn(ErrorHandler, 'parseBodyCustomException');
        const error = new CustomException({ message: 'my error' });

        errorHandler(error, {} as any, res, next);

        expect(spy).toHaveBeenNthCalledWith(1, error);
      });

      test('Should response to be an object with default values for [success, code]', async () => {
        const errorObject = {
          message: 'my error'
        };

        const error = new CustomException(errorObject);

        errorHandler(error, {} as any, res, next);

        expect(res._getJSONData()).toEqual({
          success: false,
          ...errorObject,
          code: 500
        });
      });

      test('Should response to be an object with [success, code, message, type, extra]', async () => {
        const errorObject = {
          code: 400,
          message: 'my error',
          type: 'MY_SUPER_ERROR'
        };
        const extra = {
          my_key_extra: 'my extra key'
        };

        const error = new CustomException(errorObject, extra);

        errorHandler(error, {} as any, res, next);

        expect(res._getJSONData()).toEqual({
          success: false,
          ...errorObject,
          extra
        });
      });
    });

    describe('When Error is instance of Error', () => {
      test('Should call parseBodyError() with error', () => {
        const spy = jest.spyOn(ErrorHandler, 'parseBodyError');
        const error = new Error('my error');

        errorHandler(error, {} as any, res, next);

        expect(spy).toHaveBeenNthCalledWith(1, error);
      });

      test('Should call isSQLError()', async () => {
        const error = new Error('my error');
        const spy = jest.spyOn(ErrorHandler, 'isSQLError').mockImplementation(() => true);

        errorHandler(error, {} as any, res, next);

        expect(spy).toHaveBeenNthCalledWith(1, 'my error');
      });

      test('Should response to be an object with default values for [success, code]', async () => {
        const msg = 'my error';
        const error = new Error(msg);

        errorHandler(error, {} as any, res, next);

        expect(res._getJSONData()).toMatchObject({
          success: false,
          message: msg,
          code: 500
        });
      });

      describe('When isSQLError() = true', () => {
        test('Should response to be an object with default values for [success, message, code]', () => {
          jest.spyOn(ErrorHandler, 'isSQLError').mockImplementation(() => true);
          const error = new Error('my error');

          errorHandler(error, {} as any, res, next);

          expect(res._getJSONData()).toEqual({
            success: false,
            message: 'Database error.',
            code: 500
          });
        });
      });

      test('Should call logError()', () => {
        const error = new Error('my error');
        const spy = jest.spyOn(logger, 'logError');

        errorHandler(error, {} as any, res, next);

        expect(spy).toHaveBeenCalled();
      });
    });

    describe('When any type of Error', () => {
      class MySuperError {
        message: string;

        constructor(message: string) {
          this.message = message;
        }
      }

      test('Should not call parseBodyCustomException()', () => {
        const spy = jest.spyOn(ErrorHandler, 'parseBodyCustomException');
        const error = new MySuperError('my error');

        errorHandler(error, {} as any, res, next);

        expect(spy).not.toHaveBeenCalled();
      });

      test('Should not call parseBodyError()', () => {
        const spy = jest.spyOn(ErrorHandler, 'parseBodyError');
        const error = new MySuperError('my error');

        errorHandler(error, {} as any, res, next);

        expect(spy).not.toHaveBeenCalled();
      });

      test('Should response to be an object with default values for [success, message, code]', () => {
        const error = new MySuperError('my error');

        errorHandler(error, {} as any, res, next);

        expect(res._getJSONData()).toEqual({
          success: false,
          message: 'Unknown Error.',
          code: 500
        });
      });

      test('Should call logError()', () => {
        const error = new MySuperError('my error');
        const spy = jest.spyOn(logger, 'logError');

        errorHandler(error, {} as any, res, next);

        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
