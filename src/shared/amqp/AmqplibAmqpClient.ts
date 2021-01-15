import {
  OnModuleInit,
  Injectable,
  OnApplicationShutdown,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AmqpClient,
  AmqpSubscription,
  PublishContext,
  SubscribeContext,
} from 'shared/amqp/AmqpClient';
import { connect, Connection, ConsumeMessage, ConfirmChannel } from 'amqplib';
import { Config } from 'shared/config/application/Config';
import { JsonSerializer } from 'shared/serialization/json/JsonSerializer';

@Injectable()
export class AmqplibAmqpClient
  extends AmqpClient
  implements OnModuleInit, OnApplicationShutdown {
  private readonly config: Config;
  private readonly jsonSerializer: JsonSerializer;
  private connection: Connection | null;
  private channel: ConfirmChannel | null;

  public constructor(config: Config, jsonSerializer: JsonSerializer) {
    super();
    this.config = config;
    this.jsonSerializer = jsonSerializer;
    this.connection = null;
    this.channel = null;
  }

  public async onModuleInit(): Promise<void> {
    // const connectionString = this.config.get('AMQP_CONNECTION');
    this.config; // dummy statement to suppress unused variable warning
    const connectionString = '';
    this.connection = await connect(connectionString);
    this.channel = await this.connection.createConfirmChannel();
    this.logger.log('Amqp connected');
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.assertConnection().close();
    this.logger.log('Amqp disconnected');
  }

  public async publish<T extends object>(
    ctx: PublishContext<T>,
  ): Promise<void> {
    const channel = this.assertChannel();
    await channel.assertExchange(ctx.exchange, 'direct');
    const messageBuf = await this.jsonSerializer.serialize(ctx.message);
    await new Promise<void>((resolve, reject) => {
      const backpressure = channel.publish(
        ctx.exchange,
        ctx.key,
        messageBuf,
        {},
        (err: Error | null) => {
          // see https://www.rabbitmq.com/confirms.html#server-sent-nacks
          if (err !== null) {
            reject(new InternalServerErrorException());
          } else {
            resolve();
          }
        },
      );
      if (!backpressure) {
        // TODO handle?
        // see https://www.squaremobius.net/amqp.node/channel_api.html#flowcontrol
        reject(new InternalServerErrorException());
      }
    });
  }

  public async subscribe<T extends object>(
    ctx: SubscribeContext<T>,
  ): Promise<AmqpSubscription> {
    const channel = this.assertChannel();
    await channel.assertExchange(ctx.exchange, 'direct');
    await channel.assertQueue(ctx.queue);
    await channel.bindQueue(ctx.queue, ctx.exchange, ctx.key);
    const { consumerTag } = await channel.consume(
      ctx.queue,
      async (msg): Promise<void> => {
        await this.handleConsumeMessage(msg, ctx);
      },
    );
    return new AmqplibAmqpSubscription(channel, consumerTag);
  }

  private async handleConsumeMessage<T extends object>(
    consumeMessage: ConsumeMessage | null,
    ctx: SubscribeContext<T>,
  ): Promise<void> {
    const channel = this.assertChannel();
    if (consumeMessage === null) {
      // TODO handle consumer is cancelled: https://www.rabbitmq.com/consumer-cancel.html
      return;
    }
    const message = await this.jsonSerializer.deserialize(
      ctx.messageType,
      consumeMessage.content,
    );
    try {
      await ctx.handleMessage(message);
      channel.ack(consumeMessage);
    } catch (error) {
      // TODO failure handling strategy? exp-backoff? dead-letter exchange?
      const requeue = false;
      channel.reject(consumeMessage, requeue);
      await this.handleSubscriptionError(error);
    }
  }

  public async getQueueStats(queue: string): Promise<AmqplibQueueStats> {
    const channel = this.assertChannel();
    const { messageCount, consumerCount } = await channel.assertQueue(queue);
    return { messageCount, consumerCount };
  }

  private assertConnection(): Connection {
    if (this.connection === null) {
      throw new Error('no amqp connection');
    }
    return this.connection;
  }

  private assertChannel(): ConfirmChannel {
    if (this.channel === null) {
      throw new Error('no amqp channel');
    }
    return this.channel;
  }
}

class AmqplibAmqpSubscription implements AmqpSubscription {
  private readonly channel: ConfirmChannel;
  private readonly consumerTag: string;

  public constructor(channel: ConfirmChannel, consumerTag: string) {
    this.channel = channel;
    this.consumerTag = consumerTag;
  }

  public async unsubscribe(): Promise<void> {
    await this.channel.cancel(this.consumerTag);
  }
}

interface AmqplibQueueStats {
  messageCount: number;
  consumerCount: number;
}
