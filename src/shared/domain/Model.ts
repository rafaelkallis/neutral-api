import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';

/**
 *
 */
export abstract class Model<TId extends Id> {
  public readonly id: TId;
  public readonly createdAt: CreatedAt;

  private _updatedAt: UpdatedAt;
  public get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  private readonly _domainEvents: Array<DomainEvent>;
  public get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  public constructor(id: TId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    this.id = id;
    this.createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._domainEvents = [];
  }

  /**
   *
   */
  public equals(other: Model<TId>): boolean {
    return this.id.equals(other.id);
  }

  /**
   *
   */
  protected raise(domainEvent: DomainEvent): void {
    this._updatedAt = UpdatedAt.now();
    this._domainEvents.push(domainEvent);
  }
}
