import { config } from '@auth/config';
import { winstonLogger } from '@auth/helper/logger';
import { Sequelize } from 'sequelize';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth database Server', 'debug');

export const sequelize: Sequelize = new Sequelize(config.MYSQL_DB! , {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true
  }
});

export async function databaseConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    log.info('auth service mysql database connection has been established successfully.');
  } catch (error) {
    log.error('auth service - unable connect to databse');
    log.log('error', 'AuthService databaseConnection() method error :', error);
  }
}
