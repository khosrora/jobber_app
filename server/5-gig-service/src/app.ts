import { config } from '@gig/config';
import { databaseConnection } from './database';
import express, { Express } from 'express';
import { start } from '@gig/server';
import { redisConnect } from '@gig/redis/redis.connection';

const initilize = (): void => {
  config.cloudinaryConfig();
  databaseConnection();
  const app: Express = express();
  start(app);
  redisConnect();
};

initilize();
