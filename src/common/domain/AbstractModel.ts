import { IsNumber, validateSync } from 'class-validator';
import { IsIdentifier } from 'common/validation/is-identifier';

/**
 *
 */
export abstract class AbstractModel {
  @IsIdentifier()
  public id: string;

  @IsNumber()
  public createdAt: number;

  @IsNumber()
  public updatedAt: number;

  public constructor(id: string, createdAt: number, updatedAt: number) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   *
   */
  public equals(other: AbstractModel): boolean {
    return this.id === other.id;
  }

  /**
   *
   */
  public validate(): void {
    validateSync(this);
  }
}
