import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { UnitOfWork } from 'shared/domain/unit-of-work/UnitOfWork';

export interface ReadonlyModel<TId extends Id> {
  readonly id: TId;
  readonly createdAt: CreatedAt;
  readonly updatedAt: UpdatedAt;
  readonly domainEvents: ReadonlyArray<DomainEvent>;

  equals(other: ReadonlyModel<TId>): boolean;
}

/**
 *
 */
export abstract class Model<TId extends Id> implements ReadonlyModel<TId> {
  public readonly id: TId;
  public readonly createdAt: CreatedAt;
  public updatedAt: UpdatedAt;
  public get domainEvents(): ReadonlyArray<DomainEvent> {
    return this.#domainEvents;
  }

  readonly #domainEvents: Array<DomainEvent>;

  public readonly unitOfWork: UnitOfWork;

  public constructor(
    unitOfWork: UnitOfWork,
    id: TId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.#domainEvents = [];
    this.unitOfWork = unitOfWork;
  }

  /**
   *
   */
  public equals(other: ReadonlyModel<TId>): boolean {
    return this.id.equals(other.id);
  }

  /**
   *
   */
  public raise(domainEvent: DomainEvent): void {
    this.updatedAt = UpdatedAt.now();
    this.#domainEvents.push(domainEvent);
  }

  public markDirty(): void {
    this.unitOfWork.markDirty(this);
  }
}
