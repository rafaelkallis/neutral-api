import { EventBus } from 'event/interfaces/event-bus.interface';
import { EventHandler } from 'event/interfaces/event-handler.interface';
import { AbstractEvent } from 'event/abstract.event';
import { EventSubscription } from 'event/interfaces/event-subscription.interface';
import { Injectable } from '@nestjs/common';

/**
 * Naive Event Bus
 */
@Injectable()
export class NaiveEventBus implements EventBus {
  private readonly subscriptions: Map<unknown, Set<EventHandler<any>>>;

  public constructor() {
    this.subscriptions = new Map();
  }

  /**
   *
   */
  public async publish(...events: AbstractEvent[]): Promise<void> {
    for (const event of events) {
      const eventSubscriptionSet = this.subscriptions.get(event.constructor);
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
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }
    const eventSubscriptionSet = this.subscriptions.get(event);
    eventSubscriptionSet?.add(eventHandler);
    return {
      async unsubscribe(): Promise<void> {
        eventSubscriptionSet?.delete(eventHandler);
      },
    };
  }
}
