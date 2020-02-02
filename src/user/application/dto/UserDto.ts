import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'common/dto/base.dto';
import { UserModel } from 'user/domain/UserModel';

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

  public static builder(): UserStep {
    return new UserStep();
  }
}

class UserStep {
  user(user: UserModel): AuthUserStep {
    return new AuthUserStep(user);
  }
}

class AuthUserStep {
  private readonly user: UserModel;

  public constructor(user: UserModel) {
    this.user = user;
  }

  authUser(authUser: UserModel): BuildStep {
    return new BuildStep(this.user, authUser);
  }
}

class BuildStep {
  private readonly user: UserModel;
  private readonly authUser: UserModel;

  public constructor(user: UserModel, authUser: UserModel) {
    this.user = user;
    this.authUser = authUser;
  }

  build(): UserDto {
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
