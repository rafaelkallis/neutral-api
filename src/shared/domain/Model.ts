import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Class } from 'shared/domain/Class';

export interface ReadonlyModel<TId extends Id> {
  readonly id: TId;
  readonly createdAt: CreatedAt;
  readonly updatedAt: UpdatedAt;

  equals(other: ReadonlyModel<TId>): boolean;
  getClass(): Class<ReadonlyModel<TId>>;
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

  public static getId<TId2 extends Id>(
    modelOrId: ReadonlyModel<TId2> | TId2,
  ): TId2 {
    return modelOrId instanceof Id ? modelOrId : modelOrId.id;
  }

  /**
   *
   */
  public equals(other: ReadonlyModel<TId>): boolean {
    return this.id.equals(other.id);
  }

  public abstract getClass(): Class<Model<TId>>;
}
