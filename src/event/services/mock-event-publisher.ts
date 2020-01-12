import { AbstractEvent } from 'event/abstract.event';
import { EventPublisher } from 'event/interfaces/event-publisher.interface';

/**
 * Mock Event Publisher
 */
export class MockEventPublisher implements EventPublisher {
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
