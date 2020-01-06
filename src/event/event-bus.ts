import { Event } from 'event/event';
import { EventSubscriber } from 'event/event-subscriber';
import { TransactionalEventPublisher } from 'event/transactional-event-publisher';

export const EVENT_BUS = Symbol('EVENT_BUS');

/**
 * Event Bus
 */
export interface EventBus
  extends TransactionalEventPublisher,
    EventSubscriber {}
