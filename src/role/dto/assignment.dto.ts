import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * Assignment DTO
 */
export class AssignmentDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The assignee id of the role',
    required: false,
  })
  public assigneeId?: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The assignee email of the role',
    required: false,
  })
  public assigneeEmail?: string | null;

  public constructor(
    assigneeId?: string | null,
    assigneeEmail?: string | null,
  ) {
    this.assigneeId = assigneeId;
    this.assigneeEmail = assigneeEmail;
  }
}
