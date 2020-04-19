import {
  Injectable,
  Logger,
  Type,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'shared/mediator/Request';
import { RequestHandler } from 'shared/mediator/RequestHandler';
import { Registry } from 'shared/application/Registry';

/**
 *
 */
@Injectable()
export class MediatorRegistry extends Registry<
  Type<Request<unknown>>,
  RequestHandler<unknown, Request<unknown>>
> {
  private readonly logger: Logger;

  public constructor() {
    super();
    this.logger = new Logger(MediatorRegistry.name);
  }

  public set(
    requestType: Type<Request<unknown>>,
    requestHandler: RequestHandler<unknown, Request<unknown>>,
  ): void {
    if (requestType !== requestHandler.getRequestType()) {
      throw new InternalServerErrorException(
        `Request handler ${requestHandler.constructor.name} does not handle request of type ${requestType.name}`,
      );
    }
    if (this.get(requestType) !== undefined) {
      throw new InternalServerErrorException(
        `Request handler for ${requestType.name} already registered, only 1 request handler allowed per request type`,
      );
    }
    super.set(requestType, requestHandler);
    this.logger.log(
      `Registered {${requestType.name} -> ${requestHandler.constructor.name}} request handler`,
    );
  }

  public get<T, TRequest extends Request<T>>(
    requestType: Type<TRequest>,
  ): RequestHandler<T, TRequest> | undefined {
    return super.get(requestType) as RequestHandler<T, TRequest> | undefined;
  }
}
