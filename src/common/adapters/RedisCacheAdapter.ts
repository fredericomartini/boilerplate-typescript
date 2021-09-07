import { Service } from 'typedi';
import * as IORedis from 'ioredis';
import { Cache, Value } from '@typeDefs/cache';
import RedisCache from '@config/database/RedisCache';

@Service()
export class RedisCacheAdapter implements Cache {
  readonly active: boolean;

  private readonly db: IORedis.Redis;

  constructor(db: RedisCache) {
    this.db = db.getDb();
  }

  async exists(key: string): Promise<boolean> {
    return await this.db.exists(key) === 1;
  }

  async get(key: string): Promise<Value|null> {
    const data = await this.db.get(key);

    return data ? JSON.parse(data) : null;
  }

  async set(key: string, data: Value, expireInSeconds: number): Promise<boolean> {
    const saved = await this.db.setex(key, expireInSeconds, JSON.stringify(data));

    return saved === 'OK';
  }

  async del(key: string): Promise<number> {
    return this.db.unlink(key);
  }
}

export default RedisCacheAdapter;
