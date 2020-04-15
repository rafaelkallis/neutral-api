import { Model } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';

/**
 *
 */
export class AggregateRoot<TId extends Id> extends Model<TId> {
  private readonly domainEvents: DomainEvent[];

  public constructor(id: TId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
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
