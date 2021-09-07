import {
  UnauthorizedError, AccessForbiddenError, UnsupportedMediaTypeError, ServerTooManyRequestsError
} from '@typeDefs/errors';

describe('types errors', () => {
  describe('UnauthorizedError', () => {
    test('Should return message UnauthorizedError', () => {
      const error = new UnauthorizedError();

      expect(error.message).toEqual('UnauthorizedError');
    });

    test('Should return code 401', () => {
      const error = new UnauthorizedError();

      expect(error.code).toEqual(401);
    });
  });

  describe('AccessForbiddenError', () => {
    test('Should return message AccessForbiddenError', () => {
      const error = new AccessForbiddenError();

      expect(error.message).toEqual('AccessForbiddenError');
    });

    test('Should return code 403', () => {
      const error = new AccessForbiddenError();

      expect(error.code).toEqual(403);
    });
  });

  describe('UnsupportedMediaTypeError', () => {
    test('Should return message UnsupportedMediaTypeError', () => {
      const error = new UnsupportedMediaTypeError();

      expect(error.message).toEqual('UnsupportedMediaTypeError');
    });

    test('Should return code 415', () => {
      const error = new UnsupportedMediaTypeError();

      expect(error.code).toEqual(415);
    });
  });

  describe('ServerTooManyRequestsError', () => {
    test('Should return message ServerTooManyRequestsError', () => {
      const error = new ServerTooManyRequestsError();

      expect(error.message).toEqual('ServerTooManyRequestsError');
    });

    test('Should return code 401', () => {
      const error = new ServerTooManyRequestsError();

      expect(error.code).toEqual(429);
    });
  });
});
