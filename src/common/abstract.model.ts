import { IsString, IsNumber, MaxLength, validateSync } from 'class-validator';

/**
 *
 */
export abstract class AbstractModel {
  @IsString()
  @MaxLength(24)
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
