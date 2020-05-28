import { RequestHandler } from 'shared/mediator/RequestHandler';
import { Type, Injectable } from '@nestjs/common';
import { Query } from 'shared/query/Query';

@Injectable()
export abstract class QueryHandler<
  T,
  TQuery extends Query<T>
> extends RequestHandler<T, TQuery> {
  public getRequestType(): Type<TQuery> {
    return this.getQueryType();
  }
  public abstract getQueryType(): Type<TQuery>;
}
