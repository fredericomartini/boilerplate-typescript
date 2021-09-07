import PermissionCheckerApi from '@modules/Auth/PermissionCheckerApi';
import { getAccountByToken } from '@modules/Auth/utils';
import * as logger from '@helpers/logger';

test('Should call "PermissioncheckerApi.me" with {token: "abc"}', async () => {
  const spy = jest.spyOn(PermissionCheckerApi.prototype, 'me').mockResolvedValue({ id_account: 123 } as any);

  await getAccountByToken('abc');

  expect(spy).toHaveBeenNthCalledWith(1, { token: 'abc' });
});

describe('Should throw UnauthorizedError', () => {
  test('When some error', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'me').mockRejectedValue('');

    await expect(() => getAccountByToken('abc')).rejects.toThrowError('UnauthorizedError');
  });

  test('When id_account not found on response', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'me').mockResolvedValue({ id: 123 } as any);

    await expect(() => getAccountByToken('abc')).rejects.toThrowError('UnauthorizedError');
  });

  test('Should call logError()', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'me').mockRejectedValue('');
    const spy = jest.spyOn(logger, 'logError');

    await expect(() => getAccountByToken('abc')).rejects.toThrowError('UnauthorizedError');

    expect(spy).toHaveBeenCalled();
  });
});

describe('Should NOT throw UnauthorizedError', () => {
  test('When id_account exists on response', async () => {
    jest.spyOn(PermissionCheckerApi.prototype, 'me').mockResolvedValue({ id_account: 123 } as any);
    const account = await getAccountByToken('abc');

    expect(account).toBeDefined();
  });
});
