import * as express from 'express';
import errorHandler from '@middlewares/errorHandler';
import * as request from 'supertest';
import { Request, Response, NextFunction } from 'express';

describe('Tests for middleware errorHandler', () => {
  describe('Should return response as json', () => {
    test('When errorHandler used as middleware', async () => {
      const app = express();

      app.use('/test', (_req, _res) => { throw new Error('my error'); });
      app.use(errorHandler);

      await request(app)
        .get('/test')
        .expect('Content-Type', /json/);
    });
  });

  describe('Should NOT return response as json', () => {
    test('When errorHandler NOT used as middleware', async () => {
      const app = express();

      app.use('/test', (_req, _res) => { throw new Error('my error'); });
      app.use((_error: Error, _req: Request, _res: Response, next: NextFunction) => { next(); });

      await request(app)
        .get('/test')
        .expect('Content-Type', /html/);
    });
  });
});
