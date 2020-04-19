import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { Mediator } from 'shared/mediator/Mediator';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { MediatorRegistry } from './MediatorRegistry';
import { RequestHandler } from './RequestHandler';

/**
 * Mediator Module
 */
@Module({
  imports: [UtilityModule],
  providers: [Mediator, MediatorRegistry],
  exports: [Mediator],
})
export class MediatorModule implements OnModuleInit {
  @Inject() private readonly serviceExplorer!: ServiceExplorer;
  @Inject() private readonly requestHandlerRegistry!: MediatorRegistry;

  public onModuleInit(): void {
    this.registerRequestHandlers();
  }

  private registerRequestHandlers(): void {
    for (const service of this.serviceExplorer.exploreServices()) {
      if (!(service instanceof RequestHandler)) {
        continue;
      }
      this.requestHandlerRegistry.set(service.getRequestType(), service);
    }
  }
}
