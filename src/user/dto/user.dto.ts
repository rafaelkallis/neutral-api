import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDto } from '../../common/dto/base.dto';
import { UserEntity } from '../entities/user.entity';

/**
 * User DTO
 */
export class UserDto extends BaseDto {
  @ApiModelProperty({ required: false })
  public email: string | null;

  @ApiModelProperty()
  public firstName: string;

  @ApiModelProperty()
  public lastName: string;

  public constructor(
    id: string,
    email: string | null,
    firstName: string,
    lastName: string,
    createdAt: number,
    updatedAt: number,
  ) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

export class UserDtoBuilder {
  private readonly user: UserEntity;
  private readonly authUser: UserEntity;

  public constructor(user: UserEntity, authUser: UserEntity) {
    this.user = user;
    this.authUser = authUser;
  }

  public build(): UserDto {
    const { user } = this;
    return new UserDto(
      user.id,
      this.shouldExposeEmail() ? user.email : null,
      user.firstName,
      user.lastName,
      user.createdAt,
      user.updatedAt,
    );
  }

  private shouldExposeEmail(): boolean {
    const { user, authUser } = this;
    return user.id === authUser.id;
  }
}
