import { Injectable } from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { User } from 'user/domain/User';
import { UserDto } from 'user/application/dto/UserDto';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';
import { getUserStateValue } from 'user/domain/value-objects/states/UserStateValue';

@Injectable()
@ObjectMap.mapFromTo(User, UserDto)
export class UserDtoMap extends ObjectMap<User, UserDto> {
  private readonly config: Config;

  public constructor(config: Config) {
    super();
    this.config = config;
  }

  /**
   *
   */
  protected doMap(user: User): UserDto {
    return new UserDto(
      user.id.value,
      user.email.value,
      user.name.first,
      user.name.last,
      user.createdAt.value,
      user.updatedAt.value,
      user.avatar ? this.createAvatarUrl(user) : null,
      getUserStateValue(user.state),
    );
  }

  private createAvatarUrl(user: User): string {
    const serverUrl = this.config.get('SERVER_URL');
    return serverUrl + '/users/' + user.id.value + '/avatar';
  }
}
