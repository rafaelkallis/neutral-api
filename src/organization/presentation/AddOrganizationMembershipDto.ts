import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Either } from 'shared/domain/Either';
import { UserId } from 'user/domain/value-objects/UserId';
import { Email } from 'user/domain/value-objects/Email';
import { ValidationException } from 'shared/exceptions/validation.exception';

export class AddOrganizationMembershipDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'The user id',
    required: false,
  })
  public memberId?: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'The user email',
    required: false,
  })
  public memberEmail?: string | null;

  public constructor(memberId?: string | null, memberEmail?: string | null) {
    this.memberId = memberId;
    this.memberEmail = memberEmail;
  }

  public toEither(): Either<UserId, Email> {
    if (this.memberId) {
      return Either.left(UserId.from(this.memberId));
    }
    if (this.memberEmail) {
      return Either.right(Email.of(this.memberEmail));
    }
    throw new ValidationException(
      'Membership requires either "memberId" or "memberEmail"',
    );
  }
}
