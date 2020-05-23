import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { Observable, Subject } from 'rxjs';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { CreatedAt } from './value-objects/CreatedAt';
import { UpdatedAt } from './value-objects/UpdatedAt';

export interface ReadonlyAggregateRoot<TId extends Id>
  extends ReadonlyModel<TId> {
  readonly domainEvents: ReadonlyArray<DomainEvent>;
  readonly markedDirty: Observable<void>;
}

/**
 *
 */
export abstract class AggregateRoot<TId extends Id> extends Model<TId>
  implements ReadonlyAggregateRoot<TId> {
  public abstract getRemovedModels(): Iterable<ReadonlyModel<Id>>;

  public readonly markedDirty: Subject<void>;
  public readonly domainEvents: DomainEvent[];

  public constructor(id: TId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    super(id, createdAt, updatedAt);
    this.markedDirty = new Subject();
    this.domainEvents = [];
  }

  public raise(domainEvent: DomainEvent): void {
    this.domainEvents.push(domainEvent);
  }

  // public for friend classes
  public markDirty(): void {
    this.markedDirty.next();
  }
}
