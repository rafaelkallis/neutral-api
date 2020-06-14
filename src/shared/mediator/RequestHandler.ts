import { Request } from 'shared/mediator/Request';
import { InversableMap } from 'shared/domain/InversableMap';
import { Class } from 'shared/domain/Class';

const requestHandlerRegistry: InversableMap<
  Class<RequestHandler<unknown, Request<unknown>>>,
  Class<Request<unknown>>
> = InversableMap.empty();

/**
 * Request Handler
 */
export abstract class RequestHandler<T, TRequest extends Request<T>> {
  public static register(
    requestClass: Class<Request<unknown>>,
  ): ClassDecorator {
    return (
      requestHandlerClass: Class<RequestHandler<unknown, Request<unknown>>>,
    ): void => {
      requestHandlerRegistry.set(requestHandlerClass, requestClass);
    };
  }
  public static registry = requestHandlerRegistry.asReadonly();

  public abstract handle(request: TRequest): T | Promise<T>;
}
