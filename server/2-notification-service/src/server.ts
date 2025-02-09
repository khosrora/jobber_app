import 'express-async-errors';
import http from 'http';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { winstonLogger } from '@notifications/helper/logger';
import { Application } from 'express';
import { healthRoutes } from '@notifications/routes';
import { checkConnection } from '@notifications/elasticsearch';
import { createConnection } from '@notifications/queues/connection';
import { Channel } from 'amqplib';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

export function start(app: Application): void {
  startServer(app);
  //http://localhost:4001/notification-health
  app.use('', healthRoutes());
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
  const emailChannel: Channel = (await createConnection()) as Channel;
  await consumeAuthEmailMessages(emailChannel);
  await consumeOrderEmailMessages(emailChannel);

  // const verificationLink = `${config.CLINET_URL}/confirm_email?v_token=12212122121212dadads`;
  // const messageDetails: IEmailMessageDetails = {
  //   receiverEmail: `${config.SENDER_EMAIL}`,
  //   verifyLink: verificationLink,
  //   username: 'khosro ra',
  //   template: 'forgotPassword'
  // };

  // await emailChannel.assertExchange('jobber-email-notification', 'direct');
  // const message = JSON.stringify(messageDetails);
  // emailChannel.publish('jobber-email-notification', 'auth-email', Buffer.from(message));
}

function startElasticSearch(): void {
  checkConnection();
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`worker with process id of ${process.pid} on notification server has started`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Notification server runing on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'Notification service startServer() method :', error);
  }
}
