import { AbstractEvent } from 'event/abstract.event';

/**
 * Event Subscriber
 */
export interface EventSubscriberService {
  subscribe<TEvent extends AbstractEvent>(
    event: unknown,
    eventHandler: EventHandler<TEvent>,
  ): Promise<EventSubscription>;
}

/**
 * Event Handler
 */
export interface EventHandler<TEvent extends AbstractEvent> {
  handleEvent(event: TEvent): Promise<void>;
}

/**
 * Event Subscription
 */
export interface EventSubscription {
  unsubscribe(): Promise<void>;
}
