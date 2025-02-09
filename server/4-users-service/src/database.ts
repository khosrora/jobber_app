import { Logger } from 'winston';
import { winstonLogger } from '@users/helper/logger';
import { config } from '@users/config';
import mongoose from 'mongoose';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersDatabase server', 'debug');

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    log.info('User service successfully connected to db');
  } catch (error) {
    log.log('error', 'usersService database connection method error : ', error);
  }
};

export { databaseConnection };
