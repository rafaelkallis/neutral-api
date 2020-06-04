import { Query } from 'shared/query/Query';
import { QueryHandler } from 'shared/query/QueryHandler';
import { User } from 'user/domain/User';
import { ArchiveFactory } from 'shared/archive/application/ArchiveFactory';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { JsonSerializer } from 'shared/serialization/json/JsonSerializer';
import { Injectable } from '@nestjs/common';
import { AssociatedRequest } from 'shared/mediator/RequestHandler';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserDto } from '../dto/UserDto';

export interface GetAuthUserDataZipQueryResult {
  file: string;
  contentType: string;
}

export class GetAuthUserDataZipQuery extends Query<
  GetAuthUserDataZipQueryResult
> {
  public readonly authUser: User;

  public constructor(authUser: User) {
    super();
    this.authUser = authUser;
  }
}

@Injectable()
@AssociatedRequest.d(GetAuthUserDataZipQuery)
export class GetAuthUserDataZipQueryHandler extends QueryHandler<
  GetAuthUserDataZipQueryResult,
  GetAuthUserDataZipQuery
> {
  private readonly archiveFactory: ArchiveFactory;
  private readonly objectMapper: ObjectMapper;
  private readonly jsonSerializer: JsonSerializer;
  private readonly objectStorage: ObjectStorage;

  public constructor(
    archiveFactory: ArchiveFactory,
    objectMapper: ObjectMapper,
    jsonSerializer: JsonSerializer,
    objectStorage: ObjectStorage,
  ) {
    super();
    this.archiveFactory = archiveFactory;
    this.objectMapper = objectMapper;
    this.jsonSerializer = jsonSerializer;
    this.objectStorage = objectStorage;
  }

  public async handle(
    query: GetAuthUserDataZipQuery,
  ): Promise<GetAuthUserDataZipQueryResult> {
    const archiveBuilder = this.archiveFactory.createArchiveBuilder();
    const userDto = this.objectMapper.map(query.authUser, UserDto);
    const serializedUserDto = await this.jsonSerializer.serialize(userDto);
    archiveBuilder.addBuffer('user.json', serializedUserDto);
    if (query.authUser.avatar) {
      const getResult = await this.objectStorage.get({
        containerName: 'avatars',
        key: query.authUser.avatar.value,
      });
      archiveBuilder.addFile('avatar', getResult.file);
    }
    return archiveBuilder.build();
  }
}
