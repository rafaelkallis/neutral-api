import { EventSubscriber } from 'event/interfaces/event-subscriber.interface';
import { AbstractEvent } from 'event/abstract.event';
import { EventHandler } from 'event/interfaces/event-handler.interface';
import { EventSubscription } from 'event/interfaces/event-subscription.interface';

/**
 * Mock Event Subscriber
 */
export class MockEventSubscriber implements EventSubscriber {
  /**
   *
   */
  public async subscribe<TEvent extends AbstractEvent>(
    event: unknown,
    eventHandler: EventHandler<TEvent>,
  ): Promise<EventSubscription> {
    return {
      async unsubscribe(): Promise<void> {},
    };
  }
}
