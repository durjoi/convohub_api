import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  onModuleInit() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    });

    this.redisClient.on('connect', () => console.log('Connected to Redis'));
    this.redisClient.on('error', (err) => console.error('Redis error', err));
  }

  // Custom Cache Setter
  async setCache(key: string, value: any, ttl: number = 3600) {
    await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
  }

  // Custom Cache Getter with Fallback
  async getCache(key: string) {
    const cachedData = await this.redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    return null;
  }

  // Cache Updater
  async updateCache(key: string, value: any, ttl: number = 3600) {
    await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
  }

  // Cache Invalidator
  async deleteCache(key: string) {
    await this.redisClient.del(key);
  }

  // Flush All Caches (use with caution)
  async flushAll() {
    await this.redisClient.flushall();
  }

  onModuleDestroy() {
    this.redisClient.quit(); // Closes Redis connection when the app shuts down
  }
}
