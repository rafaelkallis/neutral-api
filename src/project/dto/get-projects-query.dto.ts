import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export enum GetProjectsType {
  CREATED = 'created',
  ASSIGNED = 'assigned',
}

/**
 * Get projects query DTO
 */
export class GetProjectsQueryDto {
  @IsEnum(GetProjectsType)
  @IsOptional()
  @ApiProperty()
  public type?: GetProjectsType;

  public constructor(type?: GetProjectsType) {
    this.type = type;
  }
}
