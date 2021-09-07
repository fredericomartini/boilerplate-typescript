import * as httpMocks from 'node-mocks-http';
import PermissionCheckerApi from '@modules/Auth/PermissionCheckerApi';
import hasPermission from '@middlewares/hasPermission';
import * as logger from '@helpers/logger';

jest.mock('@modules/Auth/PermissionCheckerApi');

describe('Tests for middleware hasPermission', () => {
  const headers = { 'x-api-key': '' };
  const req = httpMocks.createRequest({ headers });
  const res = httpMocks.createResponse();
  const next = jest.fn();

  req.account = {
    id_account: '1',
    audience: {
      id_audience: '2'
    }
  } as any;

  test('Should call checkPermission with correct params', async () => {
    const spy = jest.spyOn(PermissionCheckerApi.prototype, 'checkPermission');

    hasPermission('LOGIN')(req, res, next);

    const params = {
      permission: 'LOGIN',
      type: 'audience',
      id_account: '1',
      id_audience_or_id_customer: '2'
    };

    expect(spy).toHaveBeenCalledWith(params);
  });

  test('Should call next() when has permission', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'checkPermission').mockResolvedValue(true);

    await hasPermission('LOGIN')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('Should throw AccessForbiddenError when has no permission', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'checkPermission').mockResolvedValue(false);

    await hasPermission('LOGIN')(req, res, next);

    expect(next).toHaveBeenCalledWith(new Error('AccessForbiddenError'));
  });

  test('Should call logError when has no permission', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'checkPermission').mockResolvedValue(false);

    const spy = jest.spyOn(logger, 'logError');

    await hasPermission('LOGIN')(req, res, next);

    expect(spy).toHaveBeenCalledWith(new Error('AccessForbiddenError'));
  });
});
