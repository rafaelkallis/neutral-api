import { Query } from 'shared/query/Query';
import { QueryHandler } from 'shared/query/QueryHandler';
import { User } from 'user/domain/User';
import { Type, Injectable } from '@nestjs/common';
import { ArchiveFactory } from 'shared/archive/application/ArchiveFactory';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { JsonSerializer } from 'shared/serialization/json/JsonSerializer';

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
export class GetAuthUserDataZipQueryHandler extends QueryHandler<
  GetAuthUserDataZipQueryResult,
  GetAuthUserDataZipQuery
> {
  private readonly archiveFactory: ArchiveFactory;
  private readonly jsonSerializer: JsonSerializer;
  private readonly objectStorage: ObjectStorage;

  public constructor(
    archiveFactory: ArchiveFactory,
    jsonSerializer: JsonSerializer,
    objectStorage: ObjectStorage,
  ) {
    super();
    this.archiveFactory = archiveFactory;
    this.jsonSerializer = jsonSerializer;
    this.objectStorage = objectStorage;
  }

  public async handle(
    query: GetAuthUserDataZipQuery,
  ): Promise<GetAuthUserDataZipQueryResult> {
    const archiveBuilder = this.archiveFactory.createArchiveBuilder();
    const serializedUser = await this.jsonSerializer.serialize(query.authUser);
    archiveBuilder.addBuffer('user.json', serializedUser);
    if (query.authUser.avatar) {
      const getResult = await this.objectStorage.get({
        containerName: 'avatars',
        key: query.authUser.avatar.value,
      });
      archiveBuilder.addFile('avatar', getResult.file);
    }
    return archiveBuilder.build();
  }

  public getQueryType(): Type<GetAuthUserDataZipQuery> {
    return GetAuthUserDataZipQuery;
  }
}
