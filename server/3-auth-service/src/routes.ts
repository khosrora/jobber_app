import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth';
import { verifyGatewayRequest } from '@auth/helper/gateway-middleware';
import { currentUserRoutes } from './routes/current-user';
import { healthRoutes } from './routes/health-routes';
import { searchRoutes } from './routes/search';
import { seedRoutes } from './routes/seed';

const BASE_PATH = '/api/v1/auth';

export function appRoutes(app: Application): void {
  app.use('', healthRoutes());

  app.use(BASE_PATH, searchRoutes());
  app.use(BASE_PATH, seedRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes());
}
