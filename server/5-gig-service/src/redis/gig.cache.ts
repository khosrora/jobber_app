import { config } from '@gig/config';
import { winstonLogger } from '@gig/helper/logger';
import { Logger } from 'winston';
import { client } from '@gig/redis/redis.connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigCache in redis', 'debug');

const getUserSelectedCategory = async (key: string): Promise<string> => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    const response: string = (await client.GET(key)) as string;
    return response;
  } catch (error) {
    log.log('error', 'GigService Gig cache getUserSelectedCategory() method error : ', error);
    return '';
  }
};

export { getUserSelectedCategory };
