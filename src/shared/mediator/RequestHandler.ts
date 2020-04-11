import { Type, Injectable, ScopeOptions } from '@nestjs/common';
import { Request } from 'shared/mediator/Request';
import { Optional } from 'shared/domain/Optional';

export abstract class AbstractRequestHandler<T, TRequest extends Request<T>> {
  public abstract handle(request: TRequest): Promise<T>;
}

const REQUEST_HANDLER_METADATA = Symbol('REQUEST_HANDLER_METADATA');

/**
 * Request Handler Metadata
 */
export class RequestHandlerMetadata<T, TRequest extends Request<T>> {
  public readonly requestType: Type<TRequest>;

  public constructor(requestType: Type<TRequest>) {
    this.requestType = requestType;
  }
}

/**
 *
 */
export function getRequestHandlerMetadata<T, TRequest extends Request<T>>(
  target: object,
): Optional<RequestHandlerMetadata<T, TRequest>> {
  return Optional.of(
    Reflect.getMetadata(REQUEST_HANDLER_METADATA, target.constructor),
  );
}

/**
 * Request Handler
 */
export function RequestHandler<T, TRequest extends Request<T>>(
  requestType: Type<TRequest>,
  scopeOptions?: ScopeOptions,
): ClassDecorator {
  if (!(requestType.prototype instanceof Request)) {
    throw new TypeError(
      `${requestType.name} is not a request, did you extend ${Request.name} ?`,
    );
  }
  return (requestHandlerType: Function): void => {
    if (!(requestHandlerType.prototype instanceof AbstractRequestHandler)) {
      throw new TypeError(
        `${requestHandlerType.name} is not a request handler, did you extend ${AbstractRequestHandler.name} ?`,
      );
    }
    const metadata = new RequestHandlerMetadata(requestType);
    Reflect.defineMetadata(
      REQUEST_HANDLER_METADATA,
      metadata,
      requestHandlerType.constructor,
    );
    Injectable(scopeOptions)(requestHandlerType);
  };
}
