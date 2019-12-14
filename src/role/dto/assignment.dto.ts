import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

interface AssignmentDtoProps {
  assigneeId?: string;
  assigneeEmail?: string;
}

/**
 * Assignment DTO
 */
export class AssignmentDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The assignee id of the role',
  })
  public assigneeId?: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The assignee email of the role',
  })
  public assigneeEmail?: string | null;

  private constructor() {}

  public static from(props: AssignmentDtoProps): AssignmentDto {
    return Object.assign(new AssignmentDto(), props);
  }
}
