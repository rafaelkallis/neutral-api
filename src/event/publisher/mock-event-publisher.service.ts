import { AbstractEvent } from 'event/abstract.event';
import { EventPublisherService } from 'event/publisher/event-publisher.service';

/**
 * Mock Event Publisher
 */
export class MockEventPublisherService implements EventPublisherService {
  private readonly publishedEvents: AbstractEvent[];

  public constructor() {
    this.publishedEvents = [];
  }

  /**
   *
   */
  public async publish(...events: AbstractEvent[]): Promise<void> {
    for (const event of events) {
      this.publishedEvents.push(event);
    }
  }

  /**
   *
   */
  public getPublishedEvents(): AbstractEvent[] {
    return [...this.publishedEvents];
  }
}
