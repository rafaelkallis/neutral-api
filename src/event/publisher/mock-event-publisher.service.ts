import { DomainEvent } from 'event/domain/DomainEvent';
import { EventPublisherService } from 'event/publisher/event-publisher.service';

/**
 * Mock Event Publisher
 */
export class MockEventPublisherService implements EventPublisherService {
  private readonly publishedEvents: DomainEvent[];

  public constructor() {
    this.publishedEvents = [];
  }

  /**
   *
   */
  public async publish(...events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      this.publishedEvents.push(event);
    }
  }

  /**
   *
   */
  public getPublishedEvents(): DomainEvent[] {
    return [...this.publishedEvents];
  }
}
