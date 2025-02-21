import { Logger } from 'winston';
import { winstonLogger } from '@chat/helper/logger';
import { config } from '@chat/config';
import mongoose from 'mongoose';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chatDatabase server', 'debug');

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    log.info('Chat service successfully connected to db');
  } catch (error) {
    log.log('error', 'chatService database connection method error : ', error);
  }
};

export { databaseConnection };
