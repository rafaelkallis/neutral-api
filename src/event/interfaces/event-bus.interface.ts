import { EventSubscriber } from 'event/interfaces/event-subscriber.interface';
import { EventPublisher } from 'event/interfaces/event-publisher.interface';

/**
 * Event Bus
 */
export interface EventBus extends EventPublisher, EventSubscriber {}
