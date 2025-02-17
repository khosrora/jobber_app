import { health } from '@gig/controllers/health';
import express, { Router } from 'express';

const router: Router = express.Router();

export function healthRoutes(): Router {
  router.get('/gig-helth', health);

  return router;
}
