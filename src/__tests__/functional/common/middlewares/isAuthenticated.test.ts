import * as request from 'supertest';
import * as express from 'express';
import * as isAuthenticatedModule from '@middlewares/isAuthenticated';
import errorHandler from '@middlewares/errorHandler';
import * as getAccountByToken from '@modules/Auth/utils/getAccountByToken';
import PermissionCheckerApi from '@modules/Auth/PermissionCheckerApi';

const { isAuthenticated } = isAuthenticatedModule;

let app: express.Express;

beforeEach(() => {
  app = express();
});

describe('When route has middleware isAuthenticated', () => {
  describe('Should response message to be: "UnauthorizedError"', () => {
    test('When no header', async () => {
      app.use('/protected-route', isAuthenticated, (_req, res) => res.json({ message: 'must not show message' }));
      app.use(errorHandler);

      const response = await request(app)
        .get('/protected-route')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toMatchObject({
        message: 'UnauthorizedError'
      });
    });
  });

  describe('Should response message to be: "valid header!"', () => {
    test('When valid header', async () => {
      jest.spyOn(isAuthenticatedModule, 'setAccountToRequest').mockImplementation();

      const body = { message: 'valid header!' };

      app.get('/protected-route', isAuthenticated, (_req, res) => res.json(body));
      app.use(errorHandler);

      const response = await request(app)
        .get('/protected-route')
        .set('x-api-key', 'abcd123')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(body);
    });
  });
});

describe('When route has middleware setAccountToRequest', () => {
  describe('Should response message to be: "UnauthorizedError"', () => {
    test('When account not found', async () => {
      jest.spyOn(isAuthenticatedModule, 'validateHeaders').mockImplementation();
      jest.spyOn(PermissionCheckerApi.prototype, 'me').mockRejectedValue('');
      const spy = jest.spyOn(getAccountByToken, 'default');

      app.use('/protected-route',
        isAuthenticated,
        (_req, res) => res.json({ message: 'must not show message' }));
      app.use(errorHandler);

      const response = await request(app)
        .get('/protected-route')
        .set('x-api-key', 'valid-token')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(spy).toHaveBeenCalledTimes(1);

      expect(response.body).toMatchObject({
        message: 'UnauthorizedError'
      });
    });
  });

  describe('Should response message to be: "valid user! id: 123"', () => {
    test('When account found', async () => {
      jest.spyOn(isAuthenticatedModule, 'validateHeaders').mockImplementation();
      jest.spyOn(PermissionCheckerApi.prototype, 'me').mockResolvedValue({ id_account: '123' } as any);

      const body = { message: 'valid user! id: 123' };

      app.get('/protected-route', isAuthenticated, (_req, res) => res.json({
        message: `valid user! id: ${_req.account?.id_account}`
      }));

      const response = await request(app)
        .get('/protected-route')
        .set('x-api-key', 'abcd123')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(body);
    });
  });
});
