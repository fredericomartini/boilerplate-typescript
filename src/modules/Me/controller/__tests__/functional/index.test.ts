import PermissionCheckerApi from '@modules/Auth/PermissionCheckerApi';

describe('Functional tests for Me controller', () => {
  const account = {
    id_account: '123',
    ds_email: 'teste@teste.com',
    nm_account: 'Teste',
    ts_created_at: '2018-10-18 17:20:40'
  } as any;

  test('Should return the account when the token has permission', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'me').mockResolvedValue(account);

    const { body } = await global.request.get('/v1/me').set('x-api-key', 'abcd123');

    expect(body).toEqual({ account });
  });

  test('Should throw UnauthorizedError when service me has no find an account', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'me').mockResolvedValue({} as any);

    const { body } = await global.request.get('/v1/me').set('x-api-key', 'abcd123');

    expect(body).toEqual({
      code: 401,
      message: 'UnauthorizedError',
      success: false
    });
  });
});
