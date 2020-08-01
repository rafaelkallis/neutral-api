import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { UserId } from 'user/domain/value-objects/UserId';
import { Email } from 'user/domain/value-objects/Email';
import { Either } from 'shared/domain/Either';
import { InternalServerErrorException } from '@nestjs/common';

/**
 * Assignment DTO
 */
export class AssignmentDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'The assignee id of the role',
    required: false,
  })
  public assigneeId?: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
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

  public toEither(): Either<UserId, Email> {
    if (this.assigneeId) {
      return Either.left(UserId.from(this.assigneeId));
    }
    if (this.assigneeEmail) {
      return Either.right(Email.of(this.assigneeEmail));
    }
    throw new InternalServerErrorException();
  }
}
