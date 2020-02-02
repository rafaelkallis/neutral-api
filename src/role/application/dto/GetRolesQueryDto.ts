import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * Get roles query DTO
 */
export class GetRolesQueryDto {
  @IsString()
  @ApiProperty()
  public projectId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  public after?: string;

  public constructor(projectId: string, after?: string) {
    this.projectId = projectId;
    this.after = after;
  }
}
