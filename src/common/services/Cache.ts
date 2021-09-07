import { Service } from 'typedi';
import { logError } from '@helpers/logger';
import { Cache as CacheAdapter, Value } from '@typeDefs/cache';
import RedisCacheAdapter from '@adapters/RedisCacheAdapter';

@Service()
export class Cache implements CacheAdapter {
  readonly prefix?: string;

  readonly active: boolean;

  private readonly adapter: CacheAdapter;

  constructor(adapter: RedisCacheAdapter) {
    this.active = process.env.CACHE === 'true';

    if (this.active) {
      this.prefix = process.env.CACHE_PREFIX as string;
      this.adapter = adapter;
    }
  }

  async exists(key: string) {
    try {
      if (this.active) {
        return await this.adapter.exists(`${this.prefix}${key}`);
      }
    } catch (error) {
      logError(error);
    }

    return false;
  }

  async get(key: string) {
    try {
      if (await this.exists(key)) {
        return await this.adapter.get(`${this.prefix}${key}`);
      }
    } catch (error) {
      logError(error);
    }

    return null;
  }

  async set(key: string, data: Value, expireInSeconds?: number) {
    try {
      if (this.active) {
        const ttl = expireInSeconds || Number(process.env.CACHE_IN_SECONDS);

        return await this.adapter.set(`${this.prefix}${key}`, data, ttl);
      }
    } catch (error) {
      logError(error);
    }

    return false;
  }

  async del(key: string) {
    try {
      if (this.active) {
        return await this.adapter.del(`${this.prefix}${key}`);
      }
    } catch (error) {
      logError(error);
    }

    return 0;
  }
}

export default Cache;
