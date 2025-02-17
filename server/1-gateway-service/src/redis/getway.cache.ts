import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/helper/logger';
import { createClient } from 'redis';
import { Logger } from 'winston';

type RedisCLient = ReturnType<typeof createClient>;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway cach connection to redis', 'debug');

export class GatewayCache {
  client: RedisCLient;

  constructor() {
    this.client = createClient({ url: `${config.REDIS_HOSTS}` });
  }

  public async saveUserSelectedCategory(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.SET(key, value);
    } catch (error) {
      log.log('error', 'Gateway service cache saveUserSelectedCategory() method error : ', error);
    }
  }

  public async saveLoggedInUserToCache(key: string, value: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const index: number | null = await this.client.LPOS(key, value);
      if (index === null) {
        await this.client.LPUSH(key, value);
        log.info(`User ${value} added`);
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'Gateway service cache saveLoggedInUserToCache() method error : ', error);
      return [];
    }
  }

  public async getLoggedInUserFromCache(key: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'Gateway service cache getLoggedInUserFromCache() method error : ', error);
      return [];
    }
  }

  public async removeLoggedInUserFromCache(key: string, value: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 1, value);
      log.info(`User ${value} removed`);
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'Gateway service cache removeLoggedInUserFromCache() method error : ', error);
      return [];
    }
  }
}
