import { Injectable, Type } from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { User } from 'user/domain/User';
import { UserDto } from 'user/application/dto/UserDto';
import { ObjectMapContext, ObjectMap } from 'shared/object-mapper/ObjectMap';
import { getUserStateValue } from 'user/domain/value-objects/states/UserStateValue';

@Injectable()
export class UserDtoMap extends ObjectMap<User, UserDto> {
  private readonly config: Config;

  public constructor(config: Config) {
    super();
    this.config = config;
  }

  /**
   *
   */
  protected doMap(user: User, context: ObjectMapContext): UserDto {
    const authUser = context.get('authUser', User);
    return new UserDto(
      user.id.value,
      this.mapEmail(user, authUser),
      user.name.first,
      user.name.last,
      user.createdAt.value,
      user.updatedAt.value,
      user.avatar ? this.createAvatarUrl(user) : null,
      getUserStateValue(user.state),
    );
  }

  private mapEmail(user: User, authUser: User): string | null {
    return user.id.equals(authUser.id) ? user.email.value : null;
  }

  private createAvatarUrl(user: User): string {
    const serverUrl = this.config.get('SERVER_URL');
    return serverUrl + '/users/' + user.id.value + '/avatar';
  }

  public getSourceType(): Type<User> {
    return User;
  }

  public getTargetType(): Type<UserDto> {
    return UserDto;
  }
}
