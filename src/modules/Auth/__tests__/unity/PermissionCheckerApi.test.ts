import PermissionCheckerApi from '@modules/Auth/PermissionCheckerApi';
import * as generateBody from '@modules/Auth/utils/generateBody';
import { Account, CheckPermissionParams, MeParams } from '@modules/Auth/types';
import { Cache as CacheAdapter } from '@typeDefs/cache';
import Container from 'typedi';

import Cache from '@services/Cache';

let perm: PermissionCheckerApi;

class CacheFactory implements CacheAdapter {
  active: boolean;

  exists: any = jest.fn();

  get: any = jest.fn();

  set: any = jest.fn();

  del: any = jest.fn();
}

beforeAll(() => {
  Container.set(Cache, new CacheFactory());

  perm = Container.get(PermissionCheckerApi);
});

describe('Tests for api (permission-checker)', () => {
  describe('Should have default ENV vars', () => {
    test('PERMISSION_CHECKER_URL', () => {
      expect(process.env.PERMISSION_CHECKER_URL).toBeDefined();
    });
    test('PERMISSION_CHECKER_TOKEN', () => {
      expect(process.env.PERMISSION_CHECKER_TOKEN).toBeDefined();
    });
  });

  describe('Class PermissionCheckerAPI', () => {
    describe('Should service have axios default configs', () => {
      test('header Authorization with token', () => {
        expect(perm.service.defaults.headers).toMatchObject({
          Authorization: process.env.PERMISSION_CHECKER_TOKEN
        });
      });

      test('header Content-Type = application/json', () => {
        expect(perm.service.defaults.headers).toMatchObject({ 'Content-Type': 'application/json' });
      });
    });
  });

  describe('checkPermission()', () => {
    const params: CheckPermissionParams = {
      id_account: '1234',
      permission: 'LOGIN',
      type: 'audience',
      id_audience_or_id_customer: '123456'
    };

    describe('Caching', () => {
      const key = `check-permission:${JSON.stringify(params)}`;

      test('Should call Cache.exists(), then Cache.get() with key', async () => {
        const spyExists = jest.spyOn(Container.get(Cache), 'exists').mockResolvedValue(true);
        const spyGet = jest.spyOn(Container.get(Cache), 'get');

        await perm.checkPermission(params);

        expect(spyExists).toHaveBeenNthCalledWith(1, key);

        expect(spyGet).toHaveBeenNthCalledWith(1, key);
      });

      test('Should NOT make POST request to "/check-permission" when found in Cache', async () => {
        const spyExists = jest.spyOn(Container.get(Cache), 'exists').mockResolvedValue(true);
        const spyPost = jest.spyOn(perm.service, 'post');

        await perm.checkPermission(params);

        expect(spyExists).toHaveBeenNthCalledWith(1, key);

        expect(spyPost).not.toHaveBeenCalled();
      });

      test('Should call Cache.set(), with key and value', async () => {
        const spyExists = jest.spyOn(Container.get(Cache), 'exists').mockResolvedValue(false);
        const spySet = jest.spyOn(Container.get(Cache), 'set');

        const granted = true;

        jest.spyOn(perm.service, 'post').mockImplementation(() => Promise.resolve({ data: { granted } }));

        await perm.checkPermission(params);

        expect(spyExists).toHaveBeenCalled();

        expect(spySet).toHaveBeenNthCalledWith(1, key, granted);
      });
    });

    test('Should make POST request to "/check-permission"', async () => {
      const spyPost = jest.spyOn(perm.service, 'post').mockImplementation(() => Promise.resolve({ data: {} }));

      await perm.checkPermission(params);

      expect(spyPost).toHaveBeenCalledTimes(1);
      expect(spyPost).toHaveBeenCalledWith('/check-permission', expect.any(Object));
    });

    test('Should call generateBody()', async () => {
      jest.spyOn(perm.service, 'post').mockResolvedValue({ data: {} });
      const spy = jest.spyOn(generateBody, 'default');

      await perm.checkPermission(params);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(params);
    });

    test('Should return true when granted', async () => {
      jest.spyOn(perm.service, 'post').mockResolvedValue({ data: { granted: true } });

      const granted = await perm.checkPermission(params);

      expect(granted).toBeTrue();
    });

    test('Should return false when no granted', async () => {
      jest.spyOn(perm.service, 'post').mockResolvedValue({ data: { granted: false } });

      const granted = await perm.checkPermission(params);

      expect(granted).toBeFalse();
    });
  });

  describe('me()', () => {
    const params: MeParams = {
      token: '1234'
    };

    const account: Account = {
      id_account: '1123',
      ds_email: 'teste@test.com',
      nm_account: 'teste',
      ts_created_at: 'now'
    };

    test('Should make GET request to "/me" with default values for [permissions, services] ', async () => {
      const spyPost = jest.spyOn(perm.service, 'get').mockImplementation(() => Promise.resolve({ data: {} }));

      await perm.me(params);

      expect(spyPost).toHaveBeenCalledTimes(1);
      expect(spyPost).toHaveBeenCalledWith(`/me?token=${params.token}&permissions=false&services=false`);
    });

    test('Should make GET request to "/me" with permissions = true', async () => {
      const spyPost = jest.spyOn(perm.service, 'get').mockImplementation(() => Promise.resolve({ data: {} }));

      await perm.me({ ...params, permissions: true });

      expect(spyPost).toHaveBeenCalledTimes(1);
      expect(spyPost).toHaveBeenCalledWith(`/me?token=${params.token}&permissions=true&services=false`);
    });

    test('Should make GET request to "/me" with services = true', async () => {
      const spyPost = jest.spyOn(perm.service, 'get').mockImplementation(() => Promise.resolve({ data: {} }));

      await perm.me({ ...params, services: true });

      expect(spyPost).toHaveBeenCalledTimes(1);
      expect(spyPost).toHaveBeenCalledWith(`/me?token=${params.token}&permissions=false&services=true`);
    });

    test('Should return an Account', async () => {
      jest.spyOn(perm.service, 'get').mockResolvedValue({ data: { data: account } });

      const accountResponse = await perm.me(params);

      expect(accountResponse).toStrictEqual(account);
    });

    describe('Caching', () => {
      const key = `me:${params.token}:permissions:false:services:false`;

      test('Should call Cache.exists(), then Cache.get() with key', async () => {
        const spyExists = jest.spyOn(Container.get(Cache), 'exists').mockResolvedValue(true);
        const spyGet = jest.spyOn(Container.get(Cache), 'get');

        await perm.me(params);

        expect(spyExists).toHaveBeenNthCalledWith(1, key);

        expect(spyGet).toHaveBeenNthCalledWith(1, key);
      });

      test('Should NOT make GET request to "/me" when found in Cache', async () => {
        const spyExists = jest.spyOn(Container.get(Cache), 'exists').mockResolvedValue(true);
        const spyGet = jest.spyOn(perm.service, 'get');

        await perm.me(params);

        expect(spyExists).toHaveBeenNthCalledWith(1, key);

        expect(spyGet).not.toHaveBeenCalled();
      });

      test('Should call Cache.set(), with key and value', async () => {
        const spyExists = jest.spyOn(Container.get(Cache), 'exists').mockResolvedValue(false);
        const spySet = jest.spyOn(Container.get(Cache), 'set');

        jest.spyOn(perm.service, 'get').mockImplementation(() => Promise.resolve({ data: { data: account } }));

        await perm.me(params);

        expect(spyExists).toHaveBeenCalled();

        expect(spySet).toHaveBeenNthCalledWith(1, key, account);
      });
    });
  });
});
