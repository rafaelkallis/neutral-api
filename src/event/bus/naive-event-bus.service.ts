import { Injectable } from '@nestjs/common';
import { AbstractEvent } from 'event/abstract.event';
import {
  EventSubscription,
  EventHandler,
} from 'event/subscriber/event-subscriber.service';
import { EventBusService } from 'event/bus/event-bus.service';

/**
 * Naive Event Bus
 */
@Injectable()
export class NaiveEventBusService implements EventBusService {
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
  public async publish(...events: AbstractEvent[]): Promise<void> {
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
  public async subscribe<TEvent extends AbstractEvent>(
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
