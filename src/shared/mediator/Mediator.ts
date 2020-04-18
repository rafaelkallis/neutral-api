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
export class Mediator {
  private readonly logger: Logger;
  private readonly requestHandlers: Map<
    Function,
    RequestHandler<unknown, Request<unknown>>
  >;

  public constructor() {
    this.logger = new Logger(Mediator.name);
    this.requestHandlers = new Map();
  }

  public async send<T, TRequest extends Request<T>>(
    request: TRequest,
  ): Promise<T> {
    const requestType = request.constructor as Type<TRequest>;
    const requestHandler = this.requestHandlers.get(requestType) as
      | RequestHandler<T, TRequest>
      | undefined;
    if (!requestHandler) {
      this.logger.error(
        `No request handler for ${requestType.name} registered`,
      );
      throw new InternalServerErrorException(
        `No request handler for ${requestType.name} registered`,
      );
    }
    return requestHandler.handle(request);
  }

  public registerRequestHandler<T, TRequest extends Request<T>>(
    requestHandler: RequestHandler<T, TRequest>,
  ): void {
    const requestType = requestHandler.getRequestType();
    if (this.requestHandlers.has(requestType)) {
      throw new TypeError(
        `Request handler for ${requestType.name} already registered, only 1 request handler allowed per request`,
      );
    }
    this.requestHandlers.set(requestType, requestHandler);
    this.logger.log(
      `Registered {${requestType.name}, ${requestHandler.constructor.name}} request handler`,
    );
  }
}
