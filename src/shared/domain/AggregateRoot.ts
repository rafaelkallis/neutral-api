import { Model } from 'shared/domain/Model';
import { DomainEvent } from 'shared/event/domain/DomainEvent';
import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';

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
