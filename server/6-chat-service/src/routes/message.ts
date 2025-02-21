import { message } from '@chat/controller/create';
import { conversation, conversationList, messages, userMessages } from '@chat/controller/get';
import { markMultipleMessages, markSingleMessage, offer } from '@chat/controller/update';
import express, { Router } from 'express';

const router: Router = express.Router();

export function messageRoutes(): Router {
  router.get('/conversation/:senderUsername/:reciverUsername', conversation);
  router.get('/conversations/:username', conversationList);
  router.get('/:senderUsername/:reciverUsername', messages);
  router.get('/:conversationId', userMessages);
  router.post('/', message);
  router.put('/offer', offer);
  router.put('/mark-as-read', markSingleMessage);
  router.put('/mark-multiple-as-read', markMultipleMessages);

  return router;
}
