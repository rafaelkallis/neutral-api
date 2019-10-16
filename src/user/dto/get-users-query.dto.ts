import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

interface GetUsersQueryDtoOptions {
  after?: string;
  q?: string;
}

/**
 * Get users query DTO
 */
export class GetUsersQueryDto {
  @IsString()
  @IsOptional()
  @ApiModelProperty({
    description: 'Used for pagination, results come after the specified user',
  })
  public after?: string;

  @IsString()
  @IsOptional()
  @ApiModelProperty({
    example: 'jerry',
    description: 'Query to be used for a full text search',
  })
  public q?: string;

  public static from(options: GetUsersQueryDtoOptions): GetUsersQueryDto {
    return Object.assign(new GetUsersQueryDto(), options);
  }

  private constructor() {}
}
