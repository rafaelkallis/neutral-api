import { Command } from 'shared/command/Command';
import {
  RequestHandler,
  AbstractRequestHandler,
} from 'shared/mediator/RequestHandler';
import { Type, ScopeOptions } from '@nestjs/common';
import { Query } from 'shared/query/Query';

export function QueryHandler<T, TQuery extends Query<T>>(
  queryType: Type<TQuery>,
  scopeOptions?: ScopeOptions,
): ClassDecorator {
  return (queryHandlerType: Function): void => {
    if (!(queryHandlerType.prototype instanceof AbstractQueryHandler)) {
      throw new TypeError(
        `${queryHandlerType.name} is not a query handler, did you extend ${AbstractQueryHandler.name} ?`,
      );
    }
    RequestHandler(queryType, scopeOptions)(queryHandlerType);
  };
}

export abstract class AbstractQueryHandler<
  T,
  TQuery extends Command<T>
> extends AbstractRequestHandler<T, TQuery> {}
