import { config } from '@gig/config';
import { winstonLogger } from '@gig/helper/logger';
import { createConnection } from '@gig/queues/connection';
import { updateGigReview } from '@gig/services/gig.service';
import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigService consumer', 'debug');

const consumeGigDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'jobber-update-gig';
    const routingKey = 'update-gig';
    const queueName = 'gig-update-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const jobberQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });

    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      const { gigReview } = JSON.parse(msg!.content.toString());
      await updateGigReview(JSON.parse(gigReview));
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'UsersService UserConsumer consumeGigDirectMessage() method error : ', error);
  }
};

const consumeSeedDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'jobber-seed-gig';
    const queueName = 'seed-gig-queue';
    const routingKey = 'recive-sellers';

    await channel.assertExchange(exchangeName, 'direct');
    const jobberQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });

    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      //TODO use seed data function
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'UsersService UserConsumer consumeSeedDirectMessage() method error : ', error);
  }
};

export { consumeGigDirectMessage, consumeSeedDirectMessage };
