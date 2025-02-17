import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/helper/logger';
import { createClient } from 'redis';
import { Logger } from 'winston';

type RedisCLient = ReturnType<typeof createClient>;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway connection to redis', 'debug');

class RedisConnection {
  client: RedisCLient;
  constructor() {
    this.client = createClient({ url: `${config.REDIS_HOSTS}` });
  }

  async redisConnect(): Promise<void> {
    try {
      await this.client.connect();
      log.info(`Gig service redis connection : ${await this.client.ping()}`);
    } catch (error) {
      log.log('error', 'gigService redisConnect method error ', error);
    }
  }

  cacheError(): void {
    this.client.on('error', (error: unknown) => {
      log.error(error);
    });
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
