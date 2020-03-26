import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'shared/application/dto/BaseDto';

/**
 * User DTO
 */
export class UserDto extends BaseDto {
  @ApiProperty({ required: false })
  public email: string | null;

  @ApiProperty()
  public firstName: string;

  @ApiProperty()
  public lastName: string;

  @ApiProperty()
  public avatarUrl: string | null;

  public constructor(
    id: string,
    email: string | null,
    firstName: string,
    lastName: string,
    createdAt: number,
    updatedAt: number,
    avatarUrl: string | null,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatarUrl = avatarUrl;
  }
}
