import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Config } from 'shared/config/application/Config';
import { User } from 'user/domain/User';
import { UserDto } from 'user/application/dto/UserDto';
import {
  ModelMapContext,
  AbstractModelMap,
  ModelMap,
} from 'shared/model-mapper/ModelMap';

@Injectable()
@ModelMap(User)
export class UserModelMap extends AbstractModelMap<User, UserDto> {
  private readonly config: Config;

  public constructor(config: Config) {
    super();
    this.config = config;
  }

  /**
   *
   */
  public toDto(user: User, { authUser }: ModelMapContext): UserDto {
    if (!authUser) {
      throw new InternalServerErrorException();
    }
    return new UserDto(
      user.id.value,
      this.shouldExposeEmail(user, authUser) ? user.email.value : null,
      user.name.first,
      user.name.last,
      user.createdAt.value,
      user.updatedAt.value,
      user.avatar ? this.createAvatarUrl(user) : null,
    );
  }

  private shouldExposeEmail(user: User, authUser: User): boolean {
    return user.id.equals(authUser.id);
  }

  private createAvatarUrl(user: User): string {
    const serverUrl = this.config.get('SERVER_URL');
    return serverUrl + '/users/' + user.id.value + '/avatar';
  }
}
