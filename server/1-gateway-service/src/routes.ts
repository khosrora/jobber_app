import { Application } from 'express';
import { healthRoutes } from '@gateway/routes/health';
import { authRoutes } from './routes/auth';
import { currentUserRoutes } from './routes/current-user';
import { authMiddleware } from './services/auth-middleware';
import { searchRoutes } from './routes/search';
import { buyerRoutes } from './routes/buyer';
import { sellerRoutes } from './routes/seller';
import { gigRoutes } from './routes/gig';

const BASE_PATH = '/api/gateway/v1';
// http://localhost/gateway-health
export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());

  app.use(BASE_PATH, authRoutes.routes());
  app.use(BASE_PATH, searchRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, buyerRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, sellerRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, gigRoutes.routes());
};
