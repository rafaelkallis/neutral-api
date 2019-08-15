import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Get roles query DTO
 */
export class GetRolesQueryDto {
  @IsString()
  @ApiModelProperty()
  public projectId!: string;
}
