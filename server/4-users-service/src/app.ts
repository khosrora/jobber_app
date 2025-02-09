import { config } from '@users/config';
import { databaseConnection } from './database';
import express, { Express } from 'express';
import { start } from '@users/server';

const initilize = (): void => {
  config.cloudinaryConfig();
  databaseConnection();
  const app: Express = express();
  start(app);
};

initilize();
