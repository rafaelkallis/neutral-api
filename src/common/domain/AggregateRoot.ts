import { Model } from 'common/domain/Model';
import { AbstractEvent } from 'event';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';

/**
 *
 */
export class AggregateRoot extends Model {
  private readonly domainEvents: AbstractEvent[];

  public constructor(id: Id, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    super(id, createdAt, updatedAt);
    this.domainEvents = [];
  }

  /**
   *
   */
  protected apply(domainEvent: AbstractEvent): void {
    this.domainEvents.push(domainEvent);
  }

  /**
   *
   */
  public getDomainEvents(): ReadonlyArray<AbstractEvent> {
    return this.domainEvents;
  }
}
