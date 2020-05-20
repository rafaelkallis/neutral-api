import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Id } from 'shared/domain/value-objects/Id';
import { Observable } from 'rxjs';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { CreatedAt } from './value-objects/CreatedAt';
import { UpdatedAt } from './value-objects/UpdatedAt';

export interface ReadonlyAggregateRoot<TId extends Id>
  extends ReadonlyModel<TId> {
  readonly domainEvents: ReadonlyArray<DomainEvent>;
  readonly markedDirty: Observable<void>;
  getRemovedModels(): Iterable<ReadonlyModel<Id>>;
}

/**
 *
 */
export abstract class AggregateRoot<TId extends Id> extends Model<TId>
  implements ReadonlyAggregateRoot<TId> {
  public abstract getRemovedModels(): Iterable<ReadonlyModel<Id>>;

  private readonly _domainEvents: DomainEvent[];

  public constructor(id: TId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    super(id, createdAt, updatedAt);
    this._domainEvents = [];
  }
}
