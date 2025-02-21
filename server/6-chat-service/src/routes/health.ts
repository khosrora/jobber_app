import { health } from '@chat/controller/health';
import express, { Router } from 'express';

const router: Router = express.Router();

export function healthRoutes(): Router {
  router.get('/chat-helth', health);

  return router;
}
