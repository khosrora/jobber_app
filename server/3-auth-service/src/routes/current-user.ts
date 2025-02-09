import { resendEmail } from '@auth/controllers/current-user';
import { token } from '@auth/controllers/refresh-token';
import { read } from '@auth/controllers/signin';
import express, { Router } from 'express';

const router: Router = express.Router();

export function currentUserRoutes(): Router {
  router.post('/refresh-token/:username', token);
  router.post('/currentuser', read);
  router.post('/resend-email', resendEmail);

  return router;
}
