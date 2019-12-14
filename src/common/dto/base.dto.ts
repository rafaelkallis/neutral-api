import { ApiProperty } from '@nestjs/swagger';

/**
 * Base DTO
 */
export class BaseDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public createdAt: number;

  @ApiProperty()
  public updatedAt: number;

  public constructor(id: string, createdAt: number, updatedAt: number) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
