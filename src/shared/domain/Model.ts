import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Type } from '@nestjs/common';

export interface ReadonlyModel<TId extends Id> {
  readonly id: TId;
  readonly createdAt: CreatedAt;
  readonly updatedAt: UpdatedAt;

  equals(other: ReadonlyModel<TId>): boolean;
  readonly _type: Type<ReadonlyModel<TId>>;
}

/**
 *
 */
export abstract class Model<TId extends Id> implements ReadonlyModel<TId> {
  public readonly id: TId;
  public readonly createdAt: CreatedAt;
  public updatedAt: UpdatedAt;

  public constructor(id: TId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   *
   */
  public equals(other: ReadonlyModel<TId>): boolean {
    return this.id.equals(other.id);
  }

  public abstract readonly _type: Type<Model<TId>>;
}
