import { createSandbox } from 'sinon';
import Container from 'typedi';
import RedisCacheAdapter from '@adapters/RedisCacheAdapter';
import * as IORedis from 'ioredis';

const sandbox = createSandbox();

let cacheAdapter: RedisCacheAdapter;

const key = 'my-super-key';
const cacheInSeconds = 2;

beforeAll(async () => {
  sandbox.stub(IORedis.prototype, 'connect').returns(Promise.resolve());

  Container.reset();

  sandbox.stub(process, 'env').value({
    CACHE: 'true',
    CACHE_IN_SECONDS: cacheInSeconds,
    CACHE_PORT: 5431
  });

  cacheAdapter = Container.get(RedisCacheAdapter);
});

describe('Constructor', () => {
  describe('exists()', () => {
    test('Shoul call IORedis.exists() with key', async () => {
      const spy = jest.spyOn(IORedis.prototype, 'exists').mockResolvedValue(1);

      await cacheAdapter.exists(key);

      expect(spy).toHaveBeenNthCalledWith(1, key);
    });

    test('Should return true when key exists', async () => {
      jest.spyOn(IORedis.prototype, 'exists').mockResolvedValue(1);
      const exists = await cacheAdapter.exists(key);

      expect(exists).toBeTrue();
    });

    test('Should return false when key NOT exists', async () => {
      jest.spyOn(IORedis.prototype, 'exists').mockResolvedValue(0);
      const exists = await cacheAdapter.exists(key);

      expect(exists).toBeFalse();
    });
  });

  describe('get()', () => {
    test('Shoul call IORedis.get() with key', async () => {
      const spyGet = jest.spyOn(IORedis.prototype, 'get').mockResolvedValue('');

      await cacheAdapter.get(key);
      expect(spyGet).toHaveBeenNthCalledWith(1, key);
    });

    test('Should call JSON.parse() with string from Cache when get an existent key', async () => {
      jest.spyOn(IORedis.prototype, 'get').mockResolvedValue(JSON.stringify('my-data'));
      const spy = jest.spyOn(JSON, 'parse');

      await cacheAdapter.get(key);

      expect(spy).toHaveBeenNthCalledWith(1, JSON.stringify('my-data'));
    });

    test('Should return "my-data" when get an existent key', async () => {
      jest.spyOn(IORedis.prototype, 'get').mockResolvedValue(JSON.stringify('my-data'));
      const response = await cacheAdapter.get(key);

      expect(response).toBe('my-data');
    });

    test('Should return null when key NOT exists', async () => {
      jest.spyOn(IORedis.prototype, 'get').mockResolvedValue(null);
      const data = await cacheAdapter.get(key);

      expect(data).toBeNull();
    });
  });

  describe('setex()', () => {
    test('Shoul call IORedis.setex() with key', async () => {
      const spy = jest.spyOn(IORedis.prototype, 'setex').mockResolvedValue(1);

      await cacheAdapter.set(key, 'my-data', 2000);

      expect(spy).toHaveBeenNthCalledWith(1,
        key,
        2000,
        expect.any(String));
    });

    test('Shoul call JSON.stringify()', async () => {
      const spySetex = jest.spyOn(IORedis.prototype, 'setex').mockResolvedValue(1);
      const spyJSON = jest.spyOn(JSON, 'stringify');
      const data = {
        my_key: 123,
        other: ['1', 2]
      };

      await cacheAdapter.set(key, data, 2000);

      expect(spyJSON).toHaveBeenNthCalledWith(1, data);
      expect(spySetex).toHaveBeenNthCalledWith(1,
        key,
        2000,
        JSON.stringify(data));
    });

    test('Should return true when save with success', async () => {
      jest.spyOn(IORedis.prototype, 'setex').mockResolvedValue('OK');
      const response = await cacheAdapter.set(key, 'my-data', 2000);

      expect(response).toBeTrue();
    });

    test('Should return false when not save', async () => {
      jest.spyOn(IORedis.prototype, 'setex').mockResolvedValue(null);
      const data = await cacheAdapter.set(key, 'data', 2000);

      expect(data).toBeFalse();
    });
  });

  describe('del()', () => {
    test('Shoul call IORedis.unlink() with key', async () => {
      const spy = jest.spyOn(IORedis.prototype, 'unlink').mockResolvedValue(1);

      await cacheAdapter.del(key);
      expect(spy).toHaveBeenNthCalledWith(1, key);
    });
  });
});
