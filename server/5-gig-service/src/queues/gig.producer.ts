import { config } from '@gig/config';
import { winstonLogger } from '@gig/helper/logger';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@gig/queues/connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigService producer', 'debug');

export async function publishDirectMessage(
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));

    log.info(logMessage);
  } catch (error) {
    log.log('error', 'GigService Provider publish Direct message method error :', error);
  }
}
