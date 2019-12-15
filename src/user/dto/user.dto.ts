import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../common/dto/base.dto';
import { UserEntity } from '../entities/user.entity';

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
}

interface AuthUserStep {
  withAuthUser(authUser: UserEntity): BuildStep;
}

interface BuildStep {
  build(): UserDto;
}

export class UserDtoBuilder implements AuthUserStep, BuildStep {
  private readonly user: UserEntity;
  private authUser!: UserEntity;

  public static of(user: UserEntity): AuthUserStep {
    return new UserDtoBuilder(user);
  }

  public withAuthUser(authUser: UserEntity): BuildStep {
    this.authUser = authUser;
    return this;
  }

  private constructor(user: UserEntity) {
    this.user = user;
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
