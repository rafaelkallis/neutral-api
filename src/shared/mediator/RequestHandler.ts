import { Request } from 'shared/mediator/Request';
import { StaticMap } from 'shared/application/StaticMap';

export const AssociatedRequest = new StaticMap<
  RequestHandler<unknown, Request<unknown>>,
  Request<unknown>
>();

/**
 * Request Handler
 */
export abstract class RequestHandler<T, TRequest extends Request<T>> {
  public abstract handle(request: TRequest): T | Promise<T>;
}
