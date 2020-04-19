import { Module, OnModuleInit } from '@nestjs/common';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { ObjectMapperRegistry } from 'shared/object-mapper/ObjectMapperRegistry';
import { ObjectMap } from 'shared/object-mapper/ObjectMap';

/**
 * Object Mapper Module
 */
@Module({
  imports: [UtilityModule],
  providers: [ObjectMapper, ObjectMapperRegistry],
  exports: [ObjectMapper],
})
export class ObjectMapperModule implements OnModuleInit {
  private readonly serviceExplorer: ServiceExplorer;
  private readonly objectMapperRegistry: ObjectMapperRegistry;

  public constructor(
    serviceExplorer: ServiceExplorer,
    objectMapperRegistry: ObjectMapperRegistry,
  ) {
    this.serviceExplorer = serviceExplorer;
    this.objectMapperRegistry = objectMapperRegistry;
  }

  public onModuleInit(): void {
    this.registerObjectMaps();
  }

  private registerObjectMaps(): void {
    for (const service of this.serviceExplorer.exploreServices()) {
      if (!(service instanceof ObjectMap)) {
        continue;
      }
      this.objectMapperRegistry.register(service);
    }
  }
}
