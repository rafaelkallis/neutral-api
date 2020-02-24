import { EventSubscriberService } from 'event/subscriber/event-subscriber.service';
import { EventPublisherService } from 'event/publisher/event-publisher.service';
import { Inject } from '@nestjs/common';

export const EVENT_BUS = Symbol('EVENT_BUS');

export function InjectEventBus(): ParameterDecorator {
  return Inject(EVENT_BUS);
}

/**
 * Event Bus
 */
export interface EventBus
  extends EventPublisherService,
    EventSubscriberService {}
