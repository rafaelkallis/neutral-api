import { Event } from 'event/event';
import { EventHandler, EventSubscription } from 'event/event-subscriber';
import { EventBus } from 'event/event-bus';
import { EventPublisher } from 'event/event-publisher';

/**
 * Naive Event Bus
 */
export class NaiveEventBus implements EventBus {
  private readonly subscriptions: Map<unknown, Set<EventHandler>>;

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
        await eventSubscriber(event);
      }
    }
  }

  /**
   *
   */
  public async transact<T>(
    transactionHandler: (eventPublisher: EventPublisher) => Promise<T>,
  ): Promise<T> {
    const pendingEvents: Event[] = [];
    const eventPublisher: EventPublisher = {
      async publish(...events: Event[]) {
        for (const event of events) {
          pendingEvents.push(event);
        }
      },
    };
    const result = await transactionHandler(eventPublisher);
    await this.publish(...pendingEvents);
    return result;
  }

  /**
   *
   */
  public async subscribe(
    event: unknown,
    eventHandler: EventHandler,
  ): Promise<EventSubscription> {
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }
    const eventSubscriptionSet = this.subscriptions.get(event);
    eventSubscriptionSet?.add(eventHandler);
    return {
      async unsubscribe() {
        eventSubscriptionSet?.delete(eventHandler);
      },
    };
  }
}
