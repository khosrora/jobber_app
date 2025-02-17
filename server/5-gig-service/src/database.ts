import { Logger } from 'winston';
import { winstonLogger } from '@gig/helper/logger';
import { config } from '@gig/config';
import mongoose from 'mongoose';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigDatabase server', 'debug');

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    log.info('Gig service successfully connected to db');
  } catch (error) {
    log.log('error', 'gigService database connection method error : ', error);
  }
};

export { databaseConnection };
