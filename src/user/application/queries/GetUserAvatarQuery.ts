import { Query } from 'shared/query/Query';
import { QueryHandler } from 'shared/query/QueryHandler';
import { User } from 'user/domain/User';
import { UserId } from 'user/domain/value-objects/UserId';
import { Inject, NotFoundException, Type, Injectable } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';

export class GetUserAvatarQuery extends Query<{
  file: string;
  contentType: string;
}> {
  public readonly authUser: User;
  public readonly userId: string;

  public constructor(authUser: User, userId: string) {
    super();
    this.authUser = authUser;
    this.userId = userId;
  }
}

@Injectable()
export class GetUserAvatarQueryHandler extends QueryHandler<
  { file: string; contentType: string },
  GetUserAvatarQuery
> {
  @Inject()
  private readonly userRepository!: UserRepository;
  @Inject()
  private readonly objectStorage!: ObjectStorage;

  public async handle(
    query: GetUserAvatarQuery,
  ): Promise<{ file: string; contentType: string }> {
    const { userId: rawUserId } = query;
    const userId = UserId.from(rawUserId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!user.avatar) {
      throw new NotFoundException();
    }
    const userAvatar = await this.objectStorage.get({
      containerName: 'avatars',
      key: user.avatar.value,
    });
    return userAvatar;
  }

  public getQueryType(): Type<GetUserAvatarQuery> {
    return GetUserAvatarQuery;
  }
}
