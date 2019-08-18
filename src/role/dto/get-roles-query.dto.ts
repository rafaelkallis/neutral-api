import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

interface GetRolesQueryDtoOptions {
  projectId: string;
}

/**
 * Get roles query DTO
 */
export class GetRolesQueryDto {
  @IsString()
  @ApiModelProperty()
  public projectId!: string;

  private constructor() {}

  public static from({ projectId }: GetRolesQueryDtoOptions): GetRolesQueryDto {
    const dto = new GetRolesQueryDto();
    dto.projectId = projectId;
    return dto;
  }
}
