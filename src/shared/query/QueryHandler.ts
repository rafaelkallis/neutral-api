import { RequestHandler } from 'shared/mediator/RequestHandler';
import { Query } from 'shared/query/Query';
import { Class } from 'shared/domain/Class';

export abstract class QueryHandler<
  T,
  TQuery extends Query<T>
> extends RequestHandler<T, TQuery> {
  public static register(queryClass: Class<Query<unknown>>): ClassDecorator {
    return RequestHandler.register(queryClass);
  }
}
