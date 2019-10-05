import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

interface GetRolesQueryDtoOptions {
  projectId: string;
  after?: string;
}

/**
 * Get roles query DTO
 */
export class GetRolesQueryDto {
  @IsString()
  @ApiModelProperty()
  public projectId!: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty()
  public after?: string;

  private constructor() {}

  public static from(options: GetRolesQueryDtoOptions): GetRolesQueryDto {
    return Object.assign(new GetRolesQueryDto(), options);
  }
}
