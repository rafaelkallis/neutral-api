import { AbstractEvent } from 'event/abstract.event';

/**
 * Event Publisher
 */
export interface EventPublisher {
  publish(...events: AbstractEvent[]): Promise<void>;
}
