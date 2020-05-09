import { Query } from 'shared/query/Query';
import { QueryHandler } from 'shared/query/QueryHandler';
import { User } from 'user/domain/User';
import { Type, Injectable } from '@nestjs/common';

export class GetUserDataZipQuery extends Query<{
  file: string;
  contentType: string;
}> {
  public readonly authUser: User;

  public constructor(authUser: User) {
    super();
    this.authUser = authUser;
  }
}

@Injectable()
export class GetUserDataZipQueryHandler extends QueryHandler<
  { file: string; contentType: string },
  GetUserDataZipQuery
> {
  public async handle(
    query: GetUserDataZipQuery,
  ): Promise<{ file: string; contentType: string }> {
    throw new Error('not implemented');
  }

  public getQueryType(): Type<GetUserDataZipQuery> {
    return GetUserDataZipQuery;
  }
}
