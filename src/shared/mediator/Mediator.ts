import {
  Injectable,
  Type,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Request } from 'shared/mediator/Request';
import { Request as HttpRequest } from 'express';
import { ModuleRef, ContextIdFactory, REQUEST } from '@nestjs/core';
import {
  getRequestHandlerType,
  AbstractRequestHandler,
  RequestHandler,
} from './RequestHandler';

/**
 *
 */
@Injectable()
export class Mediator {
  private readonly moduleRef: ModuleRef;
  private readonly httpRequest: HttpRequest;

  public constructor(
    moduleRef: ModuleRef,
    @Inject(REQUEST) httpRequest: HttpRequest,
  ) {
    this.moduleRef = moduleRef;
    this.httpRequest = httpRequest;
  }

  public async send<T, TRequest extends Request<T>>(
    request: TRequest,
  ): Promise<T> {
    const requestType = request.constructor as Type<TRequest>;
    const contextId = ContextIdFactory.getByRequest(this.httpRequest);
    const requestHandlerTypes = getRequestHandlerType(requestType);
    const resolvedRequestHandlers: AbstractRequestHandler<T, TRequest>[] = [];
    for (const requestHandlerType of requestHandlerTypes) {
      const resolvedRequestHandler = await this.moduleRef.resolve(
        requestHandlerType,
        contextId,
        { strict: false },
      );
      resolvedRequestHandlers.push(
        resolvedRequestHandler as AbstractRequestHandler<T, TRequest>,
      );
    }
    if (resolvedRequestHandlers.length === 0) {
      throw new InternalServerErrorException(
        `No request handler registered for ${requestType.name}, did you apply @${RequestHandler.name}(${requestType.name}) to your request handler?`,
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
