import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { Subject, Observable } from 'rxjs';
import { Type } from '@nestjs/common';

export interface ReadonlyModel<TId extends Id> {
  readonly id: TId;
  readonly createdAt: CreatedAt;
  readonly updatedAt: UpdatedAt;

  equals(other: ReadonlyModel<TId>): boolean;

  getType(): Type<ReadonlyModel<Id>>;
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

  private readonly markedDirtySubject: Subject<void>;

  public constructor(id: TId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.#domainEvents = [];
    this.markedDirtySubject = new Subject();
  }

  /**
   *
   */
  public equals(other: ReadonlyModel<TId>): boolean {
    return this.id.equals(other.id);
  }

  public abstract getType(): Type<ReadonlyModel<Id>>;
  public abstract getRemovedModels(): Iterable<ReadonlyModel<Id>>;

  /**
   *
   */
  public raise(domainEvent: DomainEvent): void {
    this.updatedAt = UpdatedAt.now();
    this.#domainEvents.push(domainEvent);
  }

  public get markedDirty(): Observable<void> {
    return this.markedDirtySubject.asObservable();
  }

  // public for project state (friend class)
  public markDirty(): void {
    // this.unitOfWork.markDirty(this);
    this.markedDirtySubject.next();
  }
}
