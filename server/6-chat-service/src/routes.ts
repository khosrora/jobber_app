import { Application } from 'express';
import { healthRoutes } from '@chat/routes/health';
import { verifyGatewayRequest } from '@chat/helper/gateway-middleware';
import { messageRoutes } from '@chat/routes/message';

const BASE_PATH = '/api/v1/message';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes);
  app.use(BASE_PATH, verifyGatewayRequest, messageRoutes());
};
export { appRoutes };
