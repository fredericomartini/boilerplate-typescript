import RedisCache from '@config/database/RedisCache';
import * as IORedis from 'ioredis';
import { createSandbox } from 'sinon';

const sandbox = createSandbox();

beforeAll(async () => {
  sandbox.stub(IORedis.prototype, 'connect').returns(Promise.resolve());
});

describe('Construct', () => {
  describe('When process.env.CACHE = true', () => {
    beforeEach(async () => {
      sandbox.stub(process, 'env').value({
        CACHE: 'true',
        CACHE_HOST: 'my-host',
        CACHE_PORT: 1234,
        CACHE_DB: 3
      });
    });

    test('Should call getConfig()', () => {
      const spy = jest.spyOn(RedisCache.prototype, 'getConfig');
      const redisDb = new RedisCache();

      expect(redisDb).toBeDefined();

      expect(spy).toHaveBeenCalled();
    });

    test('getConfig() Should return default config', () => {
      const spy = jest.spyOn(RedisCache.prototype, 'getConfig');
      const redisDb = new RedisCache();

      expect(redisDb).toBeDefined();

      expect(spy).toHaveReturnedWith({
        host: 'my-host',
        port: 1234,
        db: 3,
        connectTimeout: 2 * 1000 // 2s
      });
    });

    test('getDb() Should return instanceOf Redis', () => {
      const redisDb = new RedisCache();

      expect(redisDb.getDb()).toBeInstanceOf(jest.requireActual('ioredis'));
    });
  });

  describe('When process.env.CACHE = false', () => {
    beforeEach(async () => {
      sandbox.stub(process, 'env').value({
        CACHE: 'false',
        CACHE_HOST: 'my-host',
        CACHE_PORT: 1234,
        CACHE_DB: 3
      });
    });

    test('Should NOT call getConfig()', () => {
      const spy = jest.spyOn(RedisCache.prototype, 'getConfig');
      const redisDb = new RedisCache();

      expect(redisDb).toBeDefined();

      expect(spy).not.toHaveBeenCalled();
    });

    test('getDb() Should return undefined', () => {
      const redisDb = new RedisCache();

      expect(redisDb.getDb()).toBeUndefined();
    });
  });
});
