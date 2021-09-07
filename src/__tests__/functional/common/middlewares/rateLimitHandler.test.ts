import * as request from 'supertest';
import * as express from 'express';
import * as Limiter from '@middlewares/rateLimitHandler';
import errorHandler from '@middlewares/errorHandler';

const {
  rateLimitHandler,
  rateLimiter
} = Limiter;

let app: express.Express;

beforeEach(() => {
  app = express();
});

describe('When route has middleware rateLimitHandler', () => {
  describe('Should response message to be: "ServerTooManyRequestsError"', () => {
    test('When Throws exceptions on rateLimiter.consume()', async () => {
      jest.spyOn(rateLimiter, 'consume').mockRejectedValue('');

      app.enable('trust proxy');
      app.use('/limited', rateLimitHandler, (_req, res) => res.json({ message: 'must not show message' }));
      app.use(errorHandler);

      const response = await request(app)
        .get('/limited')
        .set('X-Forwarded-For', '192.168.2.1')
        .expect('Content-Type', /json/)
        .expect(429);

      expect(response.body).toMatchObject({
        message: 'ServerTooManyRequestsError'
      });
    });
  });

  describe('Should response message to be: "no rate-limite!"', () => {
    test('When no middlware rate-limite', async () => {
      jest.spyOn(rateLimiter, 'consume').mockRejectedValue('');
      const body = { message: 'no rate-limite!' };

      app.get('/unlimited', (_req, res) => res.json(body));

      const response = await request(app)
        .get('/unlimited')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(body);
    });
  });
});
