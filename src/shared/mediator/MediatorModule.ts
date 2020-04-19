import { Module, OnModuleInit } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { Mediator } from 'shared/mediator/Mediator';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { MediatorRegistry } from 'shared/mediator/MediatorRegistry';
import { RequestHandler } from 'shared/mediator/RequestHandler';

/**
 * Mediator Module
 */
@Module({
  imports: [UtilityModule],
  providers: [Mediator, MediatorRegistry],
  exports: [Mediator],
})
export class MediatorModule implements OnModuleInit {
  private readonly serviceExplorer: ServiceExplorer;
  private readonly registry: MediatorRegistry;

  public constructor(
    serviceExplorer: ServiceExplorer,
    registry: MediatorRegistry,
  ) {
    this.serviceExplorer = serviceExplorer;
    this.registry = registry;
  }

  public onModuleInit(): void {
    this.registerRequestHandlers();
  }

  private registerRequestHandlers(): void {
    for (const service of this.serviceExplorer.exploreServices()) {
      if (!(service instanceof RequestHandler)) {
        continue;
      }
      this.registry.register(service);
    }
  }
}
