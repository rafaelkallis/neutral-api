import { Type } from '@nestjs/common';
import { Request } from 'shared/mediator/Request';

/**
 * Request Handler
 */
export abstract class RequestHandler<T, TRequest extends Request<T>> {
  public abstract getRequestType(): Type<TRequest>;
  public abstract handle(request: TRequest): Promise<T>;
}
