import { DomainEvent } from 'event/domain/DomainEvent';
import { Inject } from '@nestjs/common';

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export function InjectEventPublisher(): ParameterDecorator {
  return Inject(EVENT_PUBLISHER);
}

/**
 * Event Publisher
 */
export interface EventPublisherService {
  /**
   *
   */
  publish(...events: DomainEvent[]): Promise<void>;
}
