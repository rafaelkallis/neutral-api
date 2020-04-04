import { ApiProperty } from '@nestjs/swagger';

/**
 * Model DTO
 */
export class ModelDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  public id: string;

  @ApiProperty({ example: 779587200 })
  public createdAt: number;

  @ApiProperty({ example: 1585674488 })
  public updatedAt: number;

  public constructor(id: string, createdAt: number, updatedAt: number) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
