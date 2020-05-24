import { ApiProperty } from '@nestjs/swagger';
import { ModelDto } from 'shared/application/dto/ModelDto';
import { UserStateValue } from 'user/domain/value-objects/states/UserStateValue';

/**
 * User DTO
 */
export class UserDto extends ModelDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Email of the user, only shown for the authenticated user',
    example: 'jerry@hungry-for-apples.com',
  })
  public email: string | null;

  @ApiProperty({ example: 'Jerry' })
  public firstName: string;

  @ApiProperty({ example: 'Smith' })
  public lastName: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'http://example.com/images/123.png',
  })
  public avatarUrl: string | null;

  @ApiProperty({
    enum: UserStateValue,
    example: UserStateValue.ACTIVE,
  })
  public state: UserStateValue;

  public constructor(
    id: string,
    email: string | null,
    firstName: string,
    lastName: string,
    createdAt: number,
    updatedAt: number,
    avatarUrl: string | null,
    state: UserStateValue,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatarUrl = avatarUrl;
    this.state = state;
  }
}
