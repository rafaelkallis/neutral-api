import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';

/**
 *
 */
export abstract class Model<TId extends Id> {
  public id: TId;
  public createdAt: CreatedAt;
  public updatedAt: UpdatedAt;

  public constructor(id: TId, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   *
   */
  public equals(other: Model<TId>): boolean {
    return this.id.equals(other.id);
  }
}
