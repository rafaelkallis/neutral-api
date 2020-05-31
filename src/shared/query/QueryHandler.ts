import { RequestHandler } from 'shared/mediator/RequestHandler';
import { Query } from 'shared/query/Query';

export abstract class QueryHandler<
  T,
  TQuery extends Query<T>
> extends RequestHandler<T, TQuery> {}
