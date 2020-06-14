import { Injectable, Type, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'shared/mediator/Request';
import { RequestHandler } from 'shared/mediator/RequestHandler';
import { ServiceLocator } from 'shared/utility/application/ServiceLocator';

/**
 *
 */
@Injectable()
export class Mediator {
  private readonly serviceLocator: ServiceLocator;

  public constructor(serviceLocator: ServiceLocator) {
    this.serviceLocator = serviceLocator;
  }

  public async send<T, TRequest extends Request<T>>(
    request: TRequest,
  ): Promise<T> {
    const requestType = request.constructor as Type<TRequest>;
    const requestHandlerTypes = RequestHandler.registry
      .inverse()
      .get(requestType);
    if (!requestHandlerTypes) {
      throw new InternalServerErrorException(
        `No request handler registered for ${requestType.name}, did you apply @${RequestHandler.name}(${requestType.name}) to your request handler?`,
      );
    }
    const resolvedRequestHandlers: RequestHandler<T, TRequest>[] = [];
    for (const requestHandlerType of requestHandlerTypes) {
      const resolvedRequestHandler = await this.serviceLocator.getService(
        requestHandlerType,
      );
      resolvedRequestHandlers.push(
        resolvedRequestHandler as RequestHandler<T, TRequest>,
      );
    }
    if (resolvedRequestHandlers.length > 1) {
      throw new InternalServerErrorException(
        `Multiple request handlers registered for ${requestType.name}. Only one request handler can be registered per request.`,
      );
    }
    return resolvedRequestHandlers[0].handle(request);
  }
}
