import { Model } from 'common/domain/Model';
import { DomainEvent } from 'event/domain/DomainEvent';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';

/**
 *
 */
export class AggregateRoot extends Model {
  private readonly domainEvents: DomainEvent[];

  public constructor(id: Id, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    super(id, createdAt, updatedAt);
    this.domainEvents = [];
  }

  /**
   *
   */
  protected apply(domainEvent: DomainEvent): void {
    this.domainEvents.push(domainEvent);
  }

  /**
   *
   */
  public getDomainEvents(): ReadonlyArray<DomainEvent> {
    return this.domainEvents;
  }
}
