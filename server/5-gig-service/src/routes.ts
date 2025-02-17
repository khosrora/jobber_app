import { verifyGatewayRequest } from '@gig/helper/gateway-middleware';
import { gigRoutes } from '@gig/routes/gig';
import { Application } from 'express';
import { healthRoutes } from './routes/health';

const BASE_PATH = '/api/v1/gig';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, gigRoutes());
};
export { appRoutes };
