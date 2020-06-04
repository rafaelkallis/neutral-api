import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { CreatedAt } from './value-objects/CreatedAt';
import { UpdatedAt } from './value-objects/UpdatedAt';

export interface ReadonlyAggregateRoot<TId extends Id>
  extends ReadonlyModel<TId> {
  readonly domainEvents: ReadonlyArray<DomainEvent>;
}

/**
 *
 */
export abstract class AggregateRoot<TId extends Id> extends Model<TId> {
  public readonly domainEvents: DomainEvent[];

  public constructor(id: TId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    super(id, createdAt, updatedAt);
    this.domainEvents = [];
  }

  public raise(domainEvent: DomainEvent): void {
    this.domainEvents.push(domainEvent);
  }

  public clearDomainEvents(): void {
    this.domainEvents.splice(0, this.domainEvents.length);
  }
}
