import {
  Injectable,
  Logger,
  Type,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'shared/mediator/Request';
import { RequestHandler } from 'shared/mediator/RequestHandler';

/**
 *
 */
@Injectable()
export class MediatorRegistry {
  private readonly logger: Logger;
  private readonly registry: Map<
    Type<Request<unknown>>,
    RequestHandler<unknown, Request<unknown>>
  >;

  public constructor() {
    this.logger = new Logger(MediatorRegistry.name);
    this.registry = new Map();
  }

  public register<T, TRequest extends Request<T>>(
    requestHandler: RequestHandler<T, TRequest>,
  ): void {
    const requestType = requestHandler.getRequestType();
    if (this.get(requestType) !== undefined) {
      throw new InternalServerErrorException(
        `Request handler for ${requestType.name} already registered, only 1 request handler allowed per request type`,
      );
    }
    this.registry.set(requestType, requestHandler);
    this.logger.log(
      `Registered {${requestType.name} -> ${requestHandler.constructor.name}} request handler`,
    );
  }

  public unregister<T, TRequest extends Request<T>>(
    requestHandler: RequestHandler<T, TRequest>,
  ): void {
    const requestType = requestHandler.getRequestType();
    if (this.get(requestType) === undefined) {
      throw new InternalServerErrorException(
        `Request handler for ${requestType.name} not registered`,
      );
    }
    this.registry.delete(requestType);
  }

  public get<T, TRequest extends Request<T>>(
    requestType: Type<TRequest>,
  ): RequestHandler<T, TRequest> | undefined {
    return this.registry.get(requestType) as
      | RequestHandler<T, TRequest>
      | undefined;
  }
}
