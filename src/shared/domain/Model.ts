import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';

export enum UnitOfWorkStatus {
  NEW,
  READ,
  DIRTY,
}

export interface ReadonlyModel<TId extends Id> {
  readonly id: TId;
  readonly createdAt: CreatedAt;
  readonly updatedAt: UpdatedAt;
  readonly domainEvents: ReadonlyArray<DomainEvent>;
  readonly unitOfWorkStatus: UnitOfWorkStatus;

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
  public unitOfWorkStatus: UnitOfWorkStatus;

  readonly #domainEvents: Array<DomainEvent>;

  public constructor(
    id: TId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    unitOfWorkStatus: UnitOfWorkStatus,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.#domainEvents = [];
    this.unitOfWorkStatus = unitOfWorkStatus;
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
    if (this.unitOfWorkStatus === UnitOfWorkStatus.READ) {
      this.unitOfWorkStatus = UnitOfWorkStatus.DIRTY;
    }
  }
}
