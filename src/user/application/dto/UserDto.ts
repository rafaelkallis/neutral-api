import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common/application/dto/BaseDto';
import { User } from 'user/domain/User';

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

  public static builder(): UserStep {
    return new UserStep();
  }
}

class UserStep {
  user(user: User): AuthUserStep {
    return new AuthUserStep(user);
  }
}

class AuthUserStep {
  private readonly user: User;

  public constructor(user: User) {
    this.user = user;
  }

  authUser(authUser: User): BuildStep {
    return new BuildStep(this.user, authUser);
  }
}

class BuildStep {
  private readonly user: User;
  private readonly authUser: User;

  public constructor(user: User, authUser: User) {
    this.user = user;
    this.authUser = authUser;
  }

  build(): UserDto {
    const { user } = this;
    return new UserDto(
      user.id.value,
      this.shouldExposeEmail() ? user.email.value : null,
      user.name.first,
      user.name.last,
      user.createdAt.value,
      user.updatedAt.value,
      user.avatar ? `http://` : null,
    );
  }

  private shouldExposeEmail(): boolean {
    const { user, authUser } = this;
    return user.id === authUser.id;
  }
}
