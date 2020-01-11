import { Event } from 'event/event';

/**
 * Event Subscriber
 */
export interface EventSubscriber {
  subscribe<TEvent extends Event>(
    event: unknown,
    eventHandler: EventHandler<TEvent>,
  ): Promise<EventSubscription>;
}

/**
 * Event Handler
 */
export interface EventHandler<TEvent extends Event> {
  handleEvent(event: TEvent): Promise<void>;
}

/**
 * Event Subscription
 */
export interface EventSubscription {
  unsubscribe(): Promise<void>;
}
