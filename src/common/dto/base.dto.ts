import { ApiModelProperty } from '@nestjs/swagger';

/**
 * Base DTO
 */
export class BaseDto {
  @ApiModelProperty()
  public id: string;

  @ApiModelProperty()
  public createdAt: number;

  @ApiModelProperty()
  public updatedAt: number;

  public constructor(id: string, createdAt: number, updatedAt: number) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
