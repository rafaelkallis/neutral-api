import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

interface GetProjectsQueryDtoOptions {
  after?: string;
}

/**
 * Get projects query DTO
 */
export class GetProjectsQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  public after?: string;

  public static from(options: GetProjectsQueryDtoOptions): GetProjectsQueryDto {
    return Object.assign(new GetProjectsQueryDto(), options);
  }

  private constructor() {}
}
