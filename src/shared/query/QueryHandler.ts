import {
  AbstractRequestHandler,
  RequestHandler,
} from 'shared/mediator/RequestHandler';
import { Type, ScopeOptions } from '@nestjs/common';
import { Query } from 'shared/query/Query';

export function QueryHandler(
  queryType: Type<Query<unknown>>,
  scopeOptions?: ScopeOptions,
): ClassDecorator {
  return function (target: Function): void {
    if (!(target.prototype instanceof AbstractQueryHandler)) {
      throw new Error(
        `${target.name} is not a query handler, did you extend ${AbstractQueryHandler.name} ?`,
      );
    }
    RequestHandler(queryType, scopeOptions)(target);
  };
}

export abstract class AbstractQueryHandler<
  T,
  TQuery extends Query<T>
> extends AbstractRequestHandler<T, TQuery> {}
