import { config } from '@auth/config';
import { winstonLogger } from '@auth/helper/logger';
import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authQueue connection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();

    log.info(`auth service connected to queueue successfully ...`);
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log('error', 'auth service createConection() method : ', error);
    return undefined;
  }
}

function closeConnection(channel: Channel, connection: Connection): void {
  process.once('SIGINT', async () => {
    await channel.close;
    await connection.close;
  });
}

export { createConnection };
