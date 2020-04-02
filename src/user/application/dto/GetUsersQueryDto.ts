import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * Get users query DTO
 */
export class GetUsersQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Used for pagination, results come after the specified user',
  })
  public after?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'jerry',
    description: 'Query to be used for a full text search',
  })
  public q?: string;

  public constructor(after?: string, q?: string) {
    this.after = after;
    this.q = q;
  }
}
