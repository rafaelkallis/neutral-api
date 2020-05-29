import { Type, ScopeOptions, Injectable } from '@nestjs/common';
import { Request } from 'shared/mediator/Request';

/**
 * Request Handler
 */
export abstract class AbstractRequestHandler<T, TRequest extends Request<T>> {
  public abstract handle(request: TRequest): T | Promise<T>;
}

const staticRequestHandlerMap: Map<
  Type<Request<unknown>>,
  Type<AbstractRequestHandler<unknown, Request<unknown>>>[]
> = new Map();

export function RequestHandler(
  requestType: Type<Request<unknown>>,
  scopeOptions?: ScopeOptions,
): ClassDecorator {
  return (target: Function): void => {
    if (!(target.prototype instanceof AbstractRequestHandler)) {
      throw new Error(
        `${target.name} is not a request handler, did you extend ${AbstractRequestHandler.name} ?`,
      );
    }
    const requestHandlerTypes = staticRequestHandlerMap.get(requestType) || [];
    staticRequestHandlerMap.set(requestType, [
      ...requestHandlerTypes,
      target as Type<AbstractRequestHandler<unknown, Request<unknown>>>,
    ]);

    Injectable(scopeOptions)(target);
  };
}

export function getRequestHandlerType(
  requestType: Type<Request<unknown>>,
): Type<AbstractRequestHandler<unknown, Request<unknown>>>[] {
  return staticRequestHandlerMap.get(requestType) || [];
}
