import { Event } from 'event/event';
import { EventHandler, EventSubscription } from 'event/event-subscriber';
import { EventBus } from 'event/event-bus';

/**
 * Naive Event Bus
 */
export class NaiveEventBus implements EventBus {
  private readonly subscriptions: Map<unknown, Set<EventHandler<any>>>;

  public constructor() {
    this.subscriptions = new Map();
  }

  /**
   *
   */
  public async publish(...events: Event[]): Promise<void> {
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
  public async subscribe<TEvent extends Event>(
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
