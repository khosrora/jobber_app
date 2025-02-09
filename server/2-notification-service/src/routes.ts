import express, { Router, Request, Response } from 'express';
import StausCodes from 'http-status-codes';

const router: Router = express.Router();

export function healthRoutes(): Router {
  router.get('/notification-health', (_req: Request, res: Response) => {
    res.status(StausCodes.OK).send('notification service is healthy and ok . :*');
  });
  return router;
}
