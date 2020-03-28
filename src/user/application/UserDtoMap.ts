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
@ModelMap(User, UserDto)
export class UserDtoMap extends AbstractModelMap<User, UserDto> {
  private readonly config: Config;

  public constructor(config: Config) {
    super();
    this.config = config;
  }

  /**
   *
   */
  public map(user: User, { authUser }: ModelMapContext): UserDto {
    if (!(authUser instanceof User)) {
      throw new InternalServerErrorException(
        'no or invalid "authUser" provided in model map context',
      );
    }
    return new UserDto(
      user.id.value,
      this.mapEmail(user, authUser),
      user.name.first,
      user.name.last,
      user.createdAt.value,
      user.updatedAt.value,
      user.avatar ? this.createAvatarUrl(user) : null,
    );
  }

  private mapEmail(user: User, authUser: User): string | null {
    return user.id.equals(authUser.id) ? user.email.value : null;
  }

  private createAvatarUrl(user: User): string {
    const serverUrl = this.config.get('SERVER_URL');
    return serverUrl + '/users/' + user.id.value + '/avatar';
  }
}
