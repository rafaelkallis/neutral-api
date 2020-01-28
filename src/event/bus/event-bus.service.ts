import { EventSubscriberService } from 'event/subscriber/event-subscriber.service';
import { EventPublisherService } from 'event/publisher/event-publisher.service';

/**
 * Event Bus
 */
export interface EventBusService
  extends EventPublisherService,
    EventSubscriberService {}
