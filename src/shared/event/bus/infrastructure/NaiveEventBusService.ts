import { Injectable } from '@nestjs/common';
import { DomainEvent } from 'shared/event/domain/DomainEvent';
import {
  EventSubscription,
  EventHandler,
} from 'shared/event/subscriber/event-subscriber.service';
import { EventBus } from 'shared/event/bus/application/EventBus';

/**
 * Naive Event Bus
 */
@Injectable()
export class NaiveEventBusService implements EventBus {
  private readonly domainEventSubscriptions: Map<
    unknown,
    Set<EventHandler<any>>
  >;

  public constructor() {
    this.domainEventSubscriptions = new Map();
  }

  /**
   *
   */
  public async publish(...events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const eventSubscriptionSet = this.domainEventSubscriptions.get(
        event.constructor,
      );
      if (!eventSubscriptionSet) {
        continue;
      }
      for (const eventSubscriber of eventSubscriptionSet.values()) {
        await eventSubscriber.handleEvent(event);
      }
    }
  }

  /**
   *
   */
  public async subscribe<TEvent extends DomainEvent>(
    event: unknown,
    eventHandler: EventHandler<TEvent>,
  ): Promise<EventSubscription> {
    if (!this.domainEventSubscriptions.has(event)) {
      this.domainEventSubscriptions.set(event, new Set());
    }
    const eventSubscriptionSet = this.domainEventSubscriptions.get(event);
    eventSubscriptionSet?.add(eventHandler);
    return {
      async unsubscribe(): Promise<void> {
        eventSubscriptionSet?.delete(eventHandler);
      },
    };
  }
}
