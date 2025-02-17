import { Logger } from 'winston';
import { winstonLogger } from '@gig/helper/logger';
import { config } from '@gig/config';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import { IAuthPayload } from '@gig/helper/auth.interface';
import compression from 'compression';
import { CustomError, IErrorResponse } from '@gig/helper/error-handler';
import http from 'http';
import { appRoutes } from '@gig/routes';
import { Channel } from 'amqplib';
import { checkConnection, createIndex } from '@gig/elasticsearch';
import { createConnection } from '@gig/queues/connection';
import { consumeGigDirectMessage, consumeSeedDirectMessage } from '@gig/queues/gig.consumer';

const SERVER_PORT = 4004;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig Server', 'debug');

let gigChannel: Channel;

const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  authErrorHandler(app);
  startServer(app);
};

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload = verify(token, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
};

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
};

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
};

async function startQueues(): Promise<void> {
  gigChannel = (await createConnection()) as Channel;
  await consumeGigDirectMessage(gigChannel);
  await consumeSeedDirectMessage(gigChannel);
}

const startElasticSearch = (): void => {
  checkConnection();
  createIndex('gigs');
};

const authErrorHandler = (app: Application): void => {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `AuthService ${error.comingFrom}:`, error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
};

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`gig server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`gig server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'gigService startServer() method error:', error);
  }
};

export { start, gigChannel };
