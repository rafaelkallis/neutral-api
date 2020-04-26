import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';

export interface ReadonlyModel<TId extends Id> {
  readonly id: TId;
  readonly createdAt: CreatedAt;
  readonly updatedAt: UpdatedAt;
  readonly domainEvents: ReadonlyArray<DomainEvent>;
}

/**
 *
 */
export abstract class Model<TId extends Id> implements ReadonlyModel<TId> {
  public readonly id: TId;
  public readonly createdAt: CreatedAt;
  public updatedAt: UpdatedAt;
  public readonly domainEvents: Array<DomainEvent>;

  public constructor(id: TId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.domainEvents = [];
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
    this.updatedAt = UpdatedAt.now();
    this.domainEvents.push(domainEvent);
  }
}
