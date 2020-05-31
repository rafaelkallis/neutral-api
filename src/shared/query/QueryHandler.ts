import { AbstractRequestHandler } from 'shared/mediator/RequestHandler';
import { Query } from 'shared/query/Query';

export abstract class AbstractQueryHandler<
  T,
  TQuery extends Query<T>
> extends AbstractRequestHandler<T, TQuery> {}
