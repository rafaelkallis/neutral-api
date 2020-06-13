import { Request } from 'shared/mediator/Request';
import { InversableMap } from 'shared/domain/InversableMap';
import { Class } from 'shared/domain/Class';

const associatedRequests: InversableMap<
  Class<RequestHandler<unknown, Request<unknown>>>,
  Class<Request<unknown>>
> = InversableMap.empty();

/**
 * Request Handler
 */
export abstract class RequestHandler<T, TRequest extends Request<T>> {
  public static ofRequest(
    requestClass: Class<Request<unknown>>,
  ): ClassDecorator {
    return (
      requestHandlerClass: Class<RequestHandler<unknown, Request<unknown>>>,
    ): void => {
      associatedRequests.set(requestHandlerClass, requestClass);
    };
  }
  public static readonly associatedRequests = associatedRequests.asReadonly();

  public abstract handle(request: TRequest): T | Promise<T>;
}
