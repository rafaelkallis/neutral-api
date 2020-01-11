import { Event } from 'event/event';

/**
 * Event Publisher
 */
export interface EventPublisher {
  publish(...events: Event[]): Promise<void>;
}
