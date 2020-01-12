import { AbstractEvent } from 'event/abstract.event';
import { EventHandler } from 'event/interfaces/event-handler.interface';
import { EventSubscription } from 'event/interfaces/event-subscription.interface';

/**
 * Event Subscriber
 */
export interface EventSubscriber {
  subscribe<TEvent extends AbstractEvent>(
    event: unknown,
    eventHandler: EventHandler<TEvent>,
  ): Promise<EventSubscription>;
}
