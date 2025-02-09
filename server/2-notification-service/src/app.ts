import express, { Express } from 'express';
import { Logger } from 'winston';
import { winstonLogger } from '@notifications/helper/logger';
import { config } from '@notifications/config';
import { start } from './server';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationApp', 'debug');

function initialize(): void {
  const app: Express = express();
  start(app);
  log.info(`notification service initialized !! :D :)`);
}

initialize();
