import { Event } from 'event/event';

/**
 * Event Subscriber
 */
export interface EventSubscriber {
  subscribe(
    event: unknown,
    subscriber: EventHandler,
  ): Promise<EventSubscription>;
}

/**
 * Event Handler
 */
export interface EventHandler {
  (event: Event): void | Promise<void>;
}

/**
 * Subscription
 */
export interface EventSubscription {
  unsubscribe(): Promise<void>;
}
