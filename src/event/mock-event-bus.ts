import { Event } from 'event/event';
import { EventHandler, EventSubscription } from 'event/event-subscriber';
import { EventBus } from 'event/event-bus';
import { EventPublisher } from 'event/event-publisher';

/**
 * Mock Event Bus
 */
export class MockEventBus implements EventBus {
  private readonly publishedEvents: Event[];

  public constructor() {
    this.publishedEvents = [];
  }

  /**
   *
   */
  public async publish(...events: Event[]): Promise<void> {
    for (const event of events) {
      this.publishedEvents.push(event);
    }
  }

  /**
   *
   */
  public async subscribe<TEvent extends Event>(
    event: unknown,
    eventHandler: EventHandler<TEvent>,
  ): Promise<EventSubscription> {
    return {
      async unsubscribe(): Promise<void> {},
    };
  }

  /**
   *
   */
  public getPublishedEvents(): Event[] {
    return [...this.publishedEvents];
  }
}
