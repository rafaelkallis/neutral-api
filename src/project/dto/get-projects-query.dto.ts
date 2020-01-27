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
  @ApiProperty({
    example: GetProjectsType.ASSIGNED,
    description: 'Specify the relation type to the projects you want to fetch.',
    enum: GetProjectsType,
  })
  public type: GetProjectsType;

  public constructor(type: GetProjectsType) {
    this.type = type;
  }
}
