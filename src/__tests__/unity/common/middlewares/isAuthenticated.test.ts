import * as httpMocks from 'node-mocks-http';
import * as isAuthenticatedModule from '@middlewares/isAuthenticated';
import * as getAccountByToken from '@modules/Auth/utils/getAccountByToken';
import PermissionCheckerAPI from '@modules/Auth/PermissionCheckerApi';

const {
  validateHeaders,
  validateToken,
  isAuthenticated,
  getToken,
  AUTH_HEADER,
  setAccountToRequest
} = isAuthenticatedModule;

describe('Tests for middleware isAuthenticated', () => {
  describe('AUTH_HEADER const', () => {
    test('Should AUTH_HEADER to be "x-api-key"', () => {
      expect(AUTH_HEADER).toBe('x-api-key');
    });
  });

  describe('validateToken()', () => {
    describe('Should throw UnauthorizedError', () => {
      test('When token x-api-key is empty string', () => {
        expect(() => validateToken('')).toThrow('UnauthorizedError');
        expect(() => validateToken(' ')).toThrow('UnauthorizedError');
      });

      test('Should extra info to be: "Header x-api-key not found"', () => {
        try {
          validateToken('');
        } catch (error) {
          expect(error).toMatchObject({
            extra: 'Header x-api-key not found'
          });
        }
      });
    });
  });

  describe('getToken()', () => {
    test('Should return token from header "x-api-key" ', () => {
      const headers = {
        my_header: '123',
        other: 'abc',
        'x-api-key': 'my-super-header'
      };

      expect(getToken(headers)).toBe('my-super-header');
    });
  });

  describe('validateHeaders()', () => {
    describe('Should call getToken()', () => {
      test('With headers', () => {
        const spy = jest.spyOn(isAuthenticatedModule, 'getToken');
        const headers = { 'x-api-key': '123', other: '123' };

        try {
          validateHeaders(headers);
        } catch (_) {
          //
        }

        expect(spy).toHaveBeenNthCalledWith(1, headers);
      });
    });

    describe('Should call validateToken()', () => {
      test('With header: "x-api-key"', () => {
        const spy = jest.spyOn(isAuthenticatedModule, 'validateToken');

        try {
          validateHeaders({ 'x-api-key': '123' });
        } catch (_) {
          //
        }

        expect(spy).toHaveBeenNthCalledWith(1, '123');
      });
    });
  });

  describe('setAccountToRequest()', () => {
    const headers = {
      'x-api-key': ''
    };
    const req = httpMocks.createRequest({ headers });

    test('Should call getAccountByToken() with token', () => {
      req.headers['x-api-key'] = 'valid-token';
      const spy = jest.spyOn(getAccountByToken, 'default').mockResolvedValue('' as any);
      const spyGetToken = jest.spyOn(isAuthenticatedModule, 'getToken');

      setAccountToRequest(req);

      expect(spyGetToken).toHaveBeenCalled();
      expect(spy).toHaveBeenNthCalledWith(1, 'valid-token');
    });

    test('Should request to have key "account" ', async () => {
      req.headers['x-api-key'] = 'valid-token';
      const account = {
        id_account: '123',
        nm_account: 'test'
      };

      jest.spyOn(getAccountByToken, 'default').mockResolvedValue(account as any);
      await setAccountToRequest(req);

      expect(req.account).toStrictEqual(account);
    });
  });

  describe('isAuthenticated()', () => {
    const headers = {
      'x-api-key': ''
    };
    const req = httpMocks.createRequest({ headers });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    describe('When call validateHeaders()', () => {
      test('Should call validateHeaders() with req.headers', () => {
        const spy = jest.spyOn(isAuthenticatedModule, 'validateHeaders').mockImplementation();

        isAuthenticated(req, res, next);

        expect(spy).toHaveBeenNthCalledWith(1, headers);
      });

      test('Should call next() with UnauthorizedError when invalid headers', async () => {
        await isAuthenticated(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('UnauthorizedError'));
      });

      test('Should call next() without params when valid headers', async () => {
        jest.spyOn(isAuthenticatedModule, 'setAccountToRequest').mockImplementation();

        req.headers['x-api-key'] = 'valid-token';

        await isAuthenticated(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });
    });

    describe('When call setAccountToRequest()', () => {
      test('Should call setAccountToRequest()', async () => {
        jest.spyOn(isAuthenticatedModule, 'validateHeaders').mockImplementation();
        const spy = jest.spyOn(isAuthenticatedModule, 'setAccountToRequest').mockImplementation();

        await isAuthenticated(req, res, next);

        expect(spy).toHaveBeenNthCalledWith(1, req);
      });

      test('should call next() with UnauthorizedError when PermissionCheckerAPI.me not return account', async () => {
        jest.spyOn(isAuthenticatedModule, 'validateHeaders').mockImplementation();
        jest.spyOn(PermissionCheckerAPI.prototype, 'me').mockResolvedValue({} as any);

        await isAuthenticated(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('UnauthorizedError'));
      });

      test('Should call next() without params when PermissionCheckerAPI.me return account', async () => {
        const account = {
          id_account: '123',
          nm_account: 'test'
        } as any;

        jest.spyOn(PermissionCheckerAPI.prototype, 'me').mockResolvedValue(account);

        await isAuthenticated(req, res, next);

        expect(next).toHaveBeenCalledWith();
      });
    });
  });
});
