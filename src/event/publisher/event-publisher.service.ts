import { AbstractEvent } from 'event/abstract.event';

/**
 * Event Publisher
 */
export interface EventPublisherService {
  publish(...events: AbstractEvent[]): Promise<void>;
}
