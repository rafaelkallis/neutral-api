import { EventSubscriber } from 'event/event-subscriber';
import { EventPublisher } from 'event/event-publisher';

export const EVENT_BUS = Symbol('EVENT_BUS');

/**
 * Event Bus
 */
export interface EventBus extends EventPublisher, EventSubscriber {}
