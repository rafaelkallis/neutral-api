import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'shared/mediator/Request';
import { RequestHandler } from 'shared/mediator/RequestHandler';
import { ServiceLocator } from 'shared/utility/application/ServiceLocator';
import { Class } from 'shared/domain/Class';

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
    const requestClass = request.constructor as Class<TRequest>;
    const requestHandlerClasses = RequestHandler.associatedRequests
      .inverse()
      .get(requestClass);
    if (!requestHandlerClasses) {
      throw new InternalServerErrorException(
        `No request handler registered for ${requestClass.name}, did you apply @${RequestHandler.name}(${requestClass.name}) to your request handler?`,
      );
    }
    const resolvedRequestHandlers: RequestHandler<T, TRequest>[] = [];
    for (const requestHandlerType of requestHandlerClasses) {
      const resolvedRequestHandler = await this.serviceLocator.getService(
        requestHandlerType,
      );
      resolvedRequestHandlers.push(
        resolvedRequestHandler as RequestHandler<T, TRequest>,
      );
    }
    if (resolvedRequestHandlers.length > 1) {
      throw new InternalServerErrorException(
        `Multiple request handlers registered for ${requestClass.name}. Only one request handler can be registered per request.`,
      );
    }
    return resolvedRequestHandlers[0].handle(request);
  }
}
