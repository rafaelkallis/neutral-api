import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { Mediator } from 'shared/mediator/Mediator';
import {
  getRequestHandlerMetadata,
  AbstractRequestHandler,
  RequestHandler,
} from './RequestHandler';

@Injectable()
export class RequestHandlerRegistrar implements OnModuleInit {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;
  private readonly mediator: Mediator;

  public constructor(serviceExplorer: ServiceExplorer, mediator: Mediator) {
    this.logger = new Logger(RequestHandlerRegistrar.name);
    this.serviceExplorer = serviceExplorer;
    this.mediator = mediator;
  }

  public onModuleInit(): void {
    this.registerRequestHandlers();
  }

  private registerRequestHandlers(): void {
    for (const service of this.serviceExplorer.exploreServices()) {
      if (!(service instanceof AbstractRequestHandler)) {
        continue;
      }
      const optionalMetadata = getRequestHandlerMetadata(service);
      if (!optionalMetadata.isPresent()) {
        throw new TypeError(
          `No request handler metadata found on ${service.constructor.name}, did you add @${RequestHandler.name}() ?`,
        );
      }
      const metadata = optionalMetadata.orElseThrow(Error);
      this.mediator.registerRequestHandler(metadata.requestType, service);
    }
    this.logger.log('Request handlers successfully registered');
  }
}
