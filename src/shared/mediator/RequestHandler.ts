import { Type, ScopeOptions, Injectable, Abstract } from '@nestjs/common';
import { Request } from 'shared/mediator/Request';
import { StaticMap } from 'shared/application/StaticMap';

export const AssociatedRequest = new StaticMap<
  AbstractRequestHandler<unknown, Request<unknown>>,
  Request<unknown>
>();

/**
 * Request Handler
 */
export abstract class AbstractRequestHandler<T, TRequest extends Request<T>> {
  public abstract handle(request: TRequest): T | Promise<T>;
}

// const staticRequestHandlerMap: Map<
//   Type<Request<unknown>>,
//   Type<AbstractRequestHandler<unknown, Request<unknown>>>[]
// > = new Map();

export function RequestHandler(
  requestType: Type<Request<unknown>>,
  scopeOptions?: ScopeOptions,
): ClassDecorator {
  return (
    requestHandlerType: Abstract<
      AbstractRequestHandler<unknown, Request<unknown>>
    >,
  ): void => {
    AssociatedRequest.d(requestType)(requestHandlerType);
    // if (!(target.prototype instanceof AbstractRequestHandler)) {
    //   throw new Error(
    //     `${target.name} is not a request handler, did you extend ${AbstractRequestHandler.name} ?`,
    //   );
    // }
    // const requestHandlerTypes = staticRequestHandlerMap.get(requestType) || [];
    // staticRequestHandlerMap.set(requestType, [
    //   ...requestHandlerTypes,
    //   target as Type<AbstractRequestHandler<unknown, Request<unknown>>>,
    // ]);

    Injectable(scopeOptions)(requestHandlerType);
  };
}

export function getRequestHandlerType(
  requestType: Type<Request<unknown>>,
): (
  | Abstract<AbstractRequestHandler<unknown, Request<unknown>>>
  | Type<AbstractRequestHandler<unknown, Request<unknown>>>
)[] {
  return AssociatedRequest.inverse().get(requestType) || [];
}
