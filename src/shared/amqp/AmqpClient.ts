import { Type, Logger } from '@nestjs/common';

export interface AmqpSubscription {
  unsubscribe(): Promise<void>;
}

export interface PublishContext<T> {
  exchange: string;
  key: string;
  message: T;
}

export interface SubscribeContext<T> {
  exchange: string;
  key: string;
  queue: string;
  messageType: Type<T>;
  handleMessage(message: T): Promise<void>;
}

export abstract class AmqpClient {
  protected readonly logger: Logger;

  public constructor() {
    this.logger = new Logger(AmqpClient.name, true);
  }

  /**
   * Publish amqp messages.
   * @param ctx The publish context.
   */
  public abstract publish<T>(ctx: PublishContext<T>): Promise<void>;

  /**
   * Subscribe to amqp messages.
   * @param ctx The subscribe context.
   */
  public abstract subscribe<T>(
    ctx: SubscribeContext<T>,
  ): Promise<AmqpSubscription>;

  protected async handleSubscriptionError(error: Error): Promise<void> {
    // TODO what to do with error? pass to telemetry?
    this.logger.error(error.toString(), error.stack);
  }
}
