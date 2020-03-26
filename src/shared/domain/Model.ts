import { validateSync } from 'class-validator';
import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';

/**
 *
 */
export abstract class Model {
  public id: Id;
  public createdAt: CreatedAt;
  public updatedAt: UpdatedAt;

  public constructor(id: Id, createdAt: CreatedAt, updatedAt: UpdatedAt) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   *
   */
  public equals(other: Model): boolean {
    return this.id.equals(other.id);
  }

  /**
   *
   */
  public validate(): void {
    validateSync(this);
  }
}
