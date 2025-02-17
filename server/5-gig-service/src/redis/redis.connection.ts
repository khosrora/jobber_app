import { config } from '@gig/config';
import { winstonLogger } from '@gig/helper/logger';
import { createClient } from 'redis';
import { Logger } from 'winston';

type RedisCLient = ReturnType<typeof createClient>;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig connection to redis', 'debug');

const client: RedisCLient = createClient({ url: `${config.REDIS_HOSTS}` });

const redisConnect = async (): Promise<void> => {
  try {
    await client.connect();
    log.info(`Gig service redis connection : ${await client.ping()}`);
  } catch (error) {
    log.log('error', 'gigService redisConnect method error ', error);
  }
};

const cacheError = (): void => {
  client.on('error', (error: unknown) => {
    log.error(error);
  });
};

export { redisConnect, client, cacheError };
