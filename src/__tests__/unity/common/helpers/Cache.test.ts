import { createSandbox } from 'sinon';
import * as logger from '@helpers/logger';
import Cache from '@services/Cache';
import Container from 'typedi';
import { Cache as CacheAdapter } from '@typeDefs/cache';
import RedisCacheAdapter from '@adapters/RedisCacheAdapter';

const sandbox = createSandbox();

class RedisCacheAdapterFake implements CacheAdapter {
  active: boolean;

  exists: any = jest.fn();

  get: any = jest.fn();

  set: any = jest.fn();

  del: any = jest.fn();
}

beforeEach(async () => {
  sandbox.restore();
});

describe('Should have defined vars', () => {
  test('CACHE', () => {
    expect(process.env.CACHE).toBeDefined();
  });

  test('CACHE_HOST', () => {
    expect(process.env.CACHE_HOST).toBeDefined();
  });

  test('CACHE_PORT', () => {
    expect(process.env.CACHE_PORT).toBeDefined();
  });

  test('CACHE_DB', () => {
    expect(process.env.CACHE_DB).toBeDefined();
  });

  test('CACHE_PREFIX', () => {
    expect(process.env.CACHE_PREFIX).toBeDefined();
  });

  test('CACHE_IN_SECONDS', () => {
    expect(process.env.CACHE_IN_SECONDS).toBeDefined();
  });
});

describe('Constructor', () => {
  let cache: Cache;
  let cacheAdapter: CacheAdapter;
  const key = 'my-super-key';
  const prefix = 'my_super_cache:';
  const keyAndPrefix = `${prefix}${key}`;

  describe('When CACHE = "true"', () => {
    const cacheInSeconds = 2;

    beforeEach(() => {
      Container.reset();

      sandbox.stub(process, 'env').value({
        CACHE: 'true',
        CACHE_PREFIX: prefix,
        CACHE_IN_SECONDS: cacheInSeconds
      });

      Container.set(RedisCacheAdapter, new RedisCacheAdapterFake());

      cache = Container.get(Cache);
      cacheAdapter = Container.get(RedisCacheAdapter);
    });

    describe('active', () => {
      test('Should be true', async () => {
        expect(cache.active).toBeTrue();
      });
    });

    describe('exists()', () => {
      test('Shoul call this.adapter.exists() with CACHE_PREFIX + key', async () => {
        await cache.exists(key);
        expect(cacheAdapter.exists).toHaveBeenNthCalledWith(1, keyAndPrefix);
      });

      test('Should return true when key exists', async () => {
        jest.spyOn(cacheAdapter, 'exists').mockResolvedValue(true);
        const exists = await cache.exists(key);

        expect(exists).toBeTrue();
      });

      test('Should return false when key NOT exists', async () => {
        jest.spyOn(cacheAdapter, 'exists').mockResolvedValue(false);
        const exists = await cache.exists(key);

        expect(exists).toBeFalse();
      });

      test('Should call logError() when some error', async () => {
        jest.spyOn(cacheAdapter, 'exists').mockRejectedValue('');
        const spy = jest.spyOn(logger, 'logError');

        await cache.exists(key);
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('get()', () => {
      test('Shoul call this.adapter.exists() AND this.adapter.get() with CACHE_PREFIX + key', async () => {
        const spyExists = jest.spyOn(cacheAdapter, 'exists').mockResolvedValue(true);
        const spyGet = jest.spyOn(cacheAdapter, 'get');

        await cache.get(key);
        expect(spyExists).toHaveBeenNthCalledWith(1, keyAndPrefix);
        expect(spyGet).toHaveBeenNthCalledWith(1, keyAndPrefix);
      });

      test('Should return "my-data" when get an existent key', async () => {
        jest.spyOn(cacheAdapter, 'exists').mockResolvedValue(true);
        jest.spyOn(cacheAdapter, 'get').mockResolvedValue('my-data');

        const response = await cache.get(key);

        expect(response).toBe('my-data');
      });

      test('Should NOT call this.adapter.get() When key NOT exists', async () => {
        jest.spyOn(cacheAdapter, 'exists').mockResolvedValue(false);
        const spy = jest.spyOn(cacheAdapter, 'get');

        await cache.get(key);

        expect(spy).not.toHaveBeenCalled();
      });

      test('Should return null when key NOT exists', async () => {
        jest.spyOn(cacheAdapter, 'exists').mockResolvedValue(false);
        const data = await cache.get(key);

        expect(data).toBeNull();
      });

      test('Should call logError() when some error', async () => {
        jest.spyOn(cacheAdapter, 'exists').mockResolvedValue(true);
        jest.spyOn(cacheAdapter, 'get').mockRejectedValue('');

        const spy = jest.spyOn(logger, 'logError');

        await cache.get(key);
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('set()', () => {
      test('Shoul call this.adapter.set() with CACHE_PREFIX + key', async () => {
        const spy = jest.spyOn(cacheAdapter, 'set');

        await cache.set(key, 'my-data');

        expect(spy).toHaveBeenNthCalledWith(1,
          keyAndPrefix,
          'my-data',
          expect.any(Number));
      });

      test('Shoul call this.adapter.set() default cacheInSeconds = 2', async () => {
        const spy = jest.spyOn(cacheAdapter, 'set');

        await cache.set(key, 'my-data');

        expect(spy).toHaveBeenNthCalledWith(1,
          keyAndPrefix,
          'my-data',
          cacheInSeconds);
      });

      test('Should return true when saved', async () => {
        jest.spyOn(cacheAdapter, 'set').mockResolvedValue(true);

        const response = await cache.set(key, 'my-data');

        expect(response).toBeTrue();
      });

      test('Should return false when NOT saved', async () => {
        jest.spyOn(cacheAdapter, 'set').mockResolvedValue(false);

        const response = await cache.set(key, 'my-data');

        expect(response).toBeFalse();
      });

      test('Should return false when error saving', async () => {
        jest.spyOn(cacheAdapter, 'set').mockRejectedValue('');
        const data = await cache.set(key, 'data');

        expect(data).toBeFalse();
      });

      test('Should call logError() when some error', async () => {
        jest.spyOn(cacheAdapter, 'set').mockRejectedValue('');
        const spy = jest.spyOn(logger, 'logError');

        await cache.set(key, 'data');
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('del()', () => {
      test('Shoul call this.adapter.del() with CACHE_PREFIX + key', async () => {
        const spy = jest.spyOn(cacheAdapter, 'del');

        await cache.del(key);

        expect(spy).toHaveBeenNthCalledWith(1, keyAndPrefix);
      });

      test('Should return 0 when NOT delete', async () => {
        jest.spyOn(cacheAdapter, 'del').mockResolvedValue(0);
        const data = await cache.del(key);

        expect(data).toBe(0);
      });

      test('Should return 0 when error deleting', async () => {
        jest.spyOn(cacheAdapter, 'del').mockRejectedValue('');
        const data = await cache.del(key);

        expect(data).toBe(0);
      });

      test('Should return number of keys removed when key exists', async () => {
        jest.spyOn(cacheAdapter, 'del').mockResolvedValue(2);
        const data = await cache.del(key);

        expect(data).toBe(2);
      });

      test('Should call logError() when some error', async () => {
        jest.spyOn(cacheAdapter, 'del').mockRejectedValue('');
        const spy = jest.spyOn(logger, 'logError');

        await cache.del(key);
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('When CACHE = false', () => {
    beforeEach(() => {
      Container.reset();

      sandbox.stub(process, 'env').value({
        CACHE: 'false'
      });

      Container.set(RedisCacheAdapter, new RedisCacheAdapterFake());

      cache = Container.get(Cache);
      cacheAdapter = Container.get(RedisCacheAdapter);
    });

    describe('active', () => {
      test('Should be false', async () => {
        expect(cache.active).toBeFalse();
      });
    });

    describe('exists()', () => {
      test('Shoul NOT call() this.adapter.exists()', async () => {
        const spy = jest.spyOn(cacheAdapter, 'exists');

        await cache.exists(key);
        expect(spy).not.toHaveBeenCalled();
      });

      test('Should return false', async () => {
        const exists = await cache.exists(key);

        expect(exists).toBeFalse();
      });
    });

    describe('get()', () => {
      test('Shoul NOT call this.adapter.exists() AND this.adapter.get()', async () => {
        const spyExists = jest.spyOn(cacheAdapter, 'exists');
        const spyGet = jest.spyOn(cacheAdapter, 'get');

        await cache.get(key);
        expect(spyExists).not.toHaveBeenCalled();
        expect(spyGet).not.toHaveBeenCalled();
      });

      test('Should return null', async () => {
        const data = await cache.get(key);

        expect(data).toBeNull();
      });
    });

    describe('set()', () => {
      test('Shoul NOT call this.adapter.set()', async () => {
        const spy = jest.spyOn(cacheAdapter, 'set');

        await cache.set(key, 'my-data');

        expect(spy).not.toHaveBeenCalled();
      });

      test('Should return false', async () => {
        const data = await cache.set(key, 'data');

        expect(data).toBeFalse();
      });
    });

    describe('del()', () => {
      test('Shoul NOT call this.adapter.del()', async () => {
        const spy = jest.spyOn(cacheAdapter, 'del');

        await cache.del(key);
        expect(spy).not.toHaveBeenCalled();
      });

      test('Should return 0', async () => {
        const data = await cache.del(key);

        expect(data).toBe(0);
      });
    });
  });
});
