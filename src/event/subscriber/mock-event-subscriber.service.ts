import { Injectable } from '@nestjs/common';
import {
  EventSubscriberService,
  EventHandler,
  EventSubscription,
} from 'event/subscriber/event-subscriber.service';
import { DomainEvent } from 'event/domain/DomainEvent';

/**
 * Mock Event Subscriber
 */
@Injectable()
export class MockEventSubscriberService implements EventSubscriberService {
  /**
   *
   */
  public async subscribe<TEvent extends DomainEvent>(
    event: unknown,
    eventHandler: EventHandler<TEvent>,
  ): Promise<EventSubscription> {
    return {
      async unsubscribe(): Promise<void> {},
    };
  }
}
