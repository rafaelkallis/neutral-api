import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Either } from 'shared/domain/Either';
import { UserId } from 'user/domain/value-objects/UserId';
import { Email } from 'user/domain/value-objects/Email';
import { ValidationException } from 'shared/application/exceptions/ValidationException';

/**
 * Add role DTO
 */
export class AddRoleDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Id of the role assignee',
    required: false,
    example: null,
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

  @IsString()
  @ApiProperty({
    example: 'Lead Hacker',
    description: 'Title of the role',
  })
  public title: string;

  @IsString()
  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut gravida purus, at sodales dui. Fusce ac lobortis ipsum. Praesent vitae pulvinar augue. Phasellus ultricies aliquam ante, efficitur semper ante volutpat sed. In semper turpis ac dui hendrerit, sit amet aliquet velit maximus. Morbi egestas tempor risus, id blandit elit elementum a. Aenean pretium elit a pellentesque mollis. Sed dignissim massa nisi, in consectetur ligula consequat blandit.', // tslint:disable-line:max-line-length
    description: 'Description of the role',
  })
  public description: string;

  public constructor(
    assigneeId: string | undefined | null,
    assigneeEmail: string | undefined | null,
    title: string,
    description: string,
  ) {
    this.assigneeId = assigneeId;
    this.assigneeEmail = assigneeEmail;
    this.title = title;
    this.description = description;
  }

  public assigneeAsEither(): Either<UserId, Email> | undefined {
    if (this.assigneeId && this.assigneeEmail) {
      throw new ValidationException(
        'Cannot have both "assigneeId" and "assigneeEmail".',
      );
    }
    if (this.assigneeId) {
      return Either.left(UserId.from(this.assigneeId));
    }
    if (this.assigneeEmail) {
      return Either.right(Email.of(this.assigneeEmail));
    }
    return undefined;
  }
}
