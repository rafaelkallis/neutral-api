import { Injectable } from '@nestjs/common';
import {
  EventSubscriberService,
  EventHandler,
  EventSubscription,
} from 'event/subscriber/event-subscriber.service';
import { AbstractEvent } from 'event/abstract.event';

/**
 * Mock Event Subscriber
 */
@Injectable()
export class MockEventSubscriberService implements EventSubscriberService {
  /**
   *
   */
  public async subscribe<TEvent extends AbstractEvent>(
    event: unknown,
    eventHandler: EventHandler<TEvent>,
  ): Promise<EventSubscription> {
    return {
      async unsubscribe(): Promise<void> {},
    };
  }
}
