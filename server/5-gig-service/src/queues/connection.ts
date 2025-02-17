import { config } from '@gig/config';
import { winstonLogger } from '@gig/helper/logger';
import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigQueue connection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
    log.info(`gig service connected to queueue successfully ...`);
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log('error', 'gig service createConection() method : ', error);
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
