import { AbstractEvent } from 'event/abstract.event';

/**
 * Event Handler
 */
export interface EventHandler<TEvent extends AbstractEvent> {
  handleEvent(event: TEvent): Promise<void>;
}
