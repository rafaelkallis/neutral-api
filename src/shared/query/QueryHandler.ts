import { RequestHandler } from 'shared/mediator/RequestHandler';
import { Type } from '@nestjs/common';
import { Query } from 'shared/query/Query';

export abstract class QueryHandler<
  T,
  TQuery extends Query<T>
> extends RequestHandler<T, TQuery> {
  public getRequestType(): Type<TQuery> {
    return this.getQueryType();
  }
  public abstract getQueryType(): Type<TQuery>;
}
