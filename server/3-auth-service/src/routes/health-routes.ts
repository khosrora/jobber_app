import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const router: Router = express.Router();

export function healthRoutes(): Router {
  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('auth service is healthy and ok . :*');
  });

  return router;
}
