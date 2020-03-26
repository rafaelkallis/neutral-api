import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { EventPublisher } from 'shared/event/publisher/EventPublisher';
import { Injectable } from '@nestjs/common';

/**
 * Fake Event Publisher
 */
@Injectable()
export class FakeEventPublisherService implements EventPublisher {
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
