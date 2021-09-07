import * as supertest from 'supertest';
import { Request, Response } from 'express';
import {
  Controller, ClassMiddleware, Get, Middleware
} from '@overnightjs/core';

import PermissionCheckerApi from '@modules/Auth/PermissionCheckerApi';
import isAuthenticated from '@middlewares/isAuthenticated';
import hasPermission from '@middlewares/hasPermission';
import errorHandler from '@middlewares/errorHandler';
import SetupServer from '../../../../server';

@Controller('fakeController')
@ClassMiddleware([isAuthenticated])
class FakeController {
  @Get('private')
  @Middleware(hasPermission('LOGIN'))
  private(req: Request, res: Response) {
    return res.json({ account: req.account });
  }

  @Get('public')
  public(req: Request, res: Response) {
    return res.json({ account: req.account });
  }
}

describe('Functional tests for middleware hasPermission', () => {
  const account = {
    id_account: '123'
  } as any;

  beforeEach(() => {
    const server = new SetupServer();

    server.addControllers([new FakeController()]);
    server.getApp().use(errorHandler);

    global.request = supertest(server.getApp());
  });

  test('Should return the account when the token has permission', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'me').mockResolvedValue(account);
    const spy = jest.spyOn(PermissionCheckerApi.prototype, 'checkPermission').mockResolvedValue(true);

    const { body } = await global.request.get('/fakeController/private').set('x-api-key', 'abcd123');

    expect(spy).toHaveBeenCalled();
    expect(body).toEqual({ account });
  });

  test('Should throw AccessForbiddenError when the token has no permission', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'me').mockResolvedValue(account);
    const spy = jest.spyOn(PermissionCheckerApi.prototype, 'checkPermission').mockResolvedValue(false);

    const { body } = await global.request.get('/fakeController/private').set('x-api-key', 'abcd123');

    expect(spy).toHaveBeenCalled();
    expect(body).toEqual({ success: false, message: 'AccessForbiddenError', code: 403 });
  });

  test('Should return the account when the route has no middleware hasPermission', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'me').mockResolvedValue(account);

    const { body } = await global.request.get('/fakeController/public').set('x-api-key', 'abcd123');

    expect(body).toEqual({ account });
  });
});
