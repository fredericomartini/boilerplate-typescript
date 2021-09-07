import * as IORedis from 'ioredis';
import { Service } from 'typedi';

@Service()
export default class RedisCache {
  private readonly db: IORedis.Redis;

  constructor() {
    if (process.env.CACHE === 'true') {
      this.db = new IORedis(this.getConfig());
    }
  }

  getConfig() {
    return {
      host: process.env.CACHE_HOST as string,
      port: Number(process.env.CACHE_PORT),
      db: Number(process.env.CACHE_DB),
      connectTimeout: 2 * 1000 // 2s
    };
  }

  getDb() {
    return this.db;
  }
}
