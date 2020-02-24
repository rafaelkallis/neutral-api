import { Inject } from '@nestjs/common';
import { DomainEvent } from 'event/domain/DomainEvent';

export const EVENT_SUBSCRIBER = Symbol('EVENT_SUBSCRIBER');

export function InjectEventSubscriber(): ParameterDecorator {
  return Inject(EVENT_SUBSCRIBER);
}

/**
 * Event Subscriber
 */
export interface EventSubscriberService {
  subscribe<TEvent extends DomainEvent>(
    event: unknown,
    eventHandler: EventHandler<TEvent>,
  ): Promise<EventSubscription>;
}

/**
 * Event Handler
 */
export interface EventHandler<TEvent extends DomainEvent> {
  handleEvent(event: TEvent): Promise<void>;
}

/**
 * Event Subscription
 */
export interface EventSubscription {
  unsubscribe(): Promise<void>;
}
