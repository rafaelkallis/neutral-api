import { Injectable, Type } from '@nestjs/common';
import {
  DomainEventBroker,
  DomainEventSubscription,
  DomainEventHandler,
} from 'shared/domain-event/application/DomainEventBroker';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { AmqpClient } from 'shared/amqp/AmqpClient';
import {
  getDomainEventKey,
  DomainEventKey,
} from 'shared/domain-event/domain/DomainEventKey';

@Injectable()
export class AmqpDomainEventBroker extends DomainEventBroker {
  private static readonly EXCHANGE = 'covee.domain-events';

  private readonly amqpClient: AmqpClient;

  public constructor(amqpClient: AmqpClient) {
    super();
    this.amqpClient = amqpClient;
  }

  public async publish(...domainEvents: DomainEvent[]): Promise<void> {
    for (const domainEvent of domainEvents) {
      const key = getDomainEventKey(domainEvent.constructor);
      if (!key) {
        throw new Error(
          `Domain event ${domainEvent.constructor.name} has no event key, did you forget @${DomainEventKey.name}("event_key") ?`,
        );
      }
      await this.amqpClient.publish({
        exchange: AmqpDomainEventBroker.EXCHANGE,
        key,
        message: domainEvent,
      });
    }
  }

  public async subscribe<T extends DomainEvent>(
    domainEventType: Type<T>,
    domainEventHandler: DomainEventHandler<T>,
  ): Promise<DomainEventSubscription> {
    const key = getDomainEventKey(domainEventType);
    if (!key) {
      throw new Error(
        `${domainEventType.name} has no event key, did you forget @${DomainEventKey.name}("event_key") ?`,
      );
    }
    return this.amqpClient.subscribe({
      exchange: AmqpDomainEventBroker.EXCHANGE,
      key,
      queue: domainEventHandler.key,
      messageType: domainEventType,
      async handleMessage(message: T) {
        await domainEventHandler.handleDomainEvent(message);
      },
    });
  }
}
