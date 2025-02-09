import { username } from '@users/controllers/buyer/get';
import { seller as create } from '@users/controllers/seller/create';
import { id, random } from '@users/controllers/seller/get';
import { seller as update } from '@users/controllers/seller/update';
import express, { Router } from 'express';

const router: Router = express.Router();
const sellerRoutes = (): Router => {
  router.get('/id/:sellerId', id);
  router.get('/username/:username', username);
  router.get('/random/:size', random);

  router.post('/create', create);
  router.put('/:sellerId', update);
  return router;
};

export { sellerRoutes };
