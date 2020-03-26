import { EventSubscriberService } from 'shared/event/subscriber/event-subscriber.service';
import { EventPublisher } from 'shared/event/publisher/EventPublisher';
import { Inject } from '@nestjs/common';

export const EVENT_BUS = Symbol('EVENT_BUS');

export function InjectEventBus(): ParameterDecorator {
  return Inject(EVENT_BUS);
}

/**
 * Event Bus
 */
export interface EventBus extends EventPublisher, EventSubscriberService {}
