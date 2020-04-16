import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { CacheClient } from 'shared/cache/application/CacheClient';
import { getCacheMetadataItems } from 'shared/cache/application/Cache';

@Injectable()
export class CacheRegistrar implements OnModuleInit {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;
  private readonly cacheClient: CacheClient;

  public constructor(
    serviceExplorer: ServiceExplorer,
    cacheClient: CacheClient,
  ) {
    this.logger = new Logger(CacheRegistrar.name);
    this.serviceExplorer = serviceExplorer;
    this.cacheClient = cacheClient;
  }

  public onModuleInit(): void {
    this.registerCaches();
  }

  private registerCaches(): void {
    for (const service of this.serviceExplorer.exploreServices()) {
      const metadataItems = getCacheMetadataItems(service);
      if (metadataItems.length === 0) {
        continue;
      }
      this.logger.log(service.constructor.name);
      for (const metadata of metadataItems) {
        this.cacheClient.cacheMethod({
          target: service,
          method: metadata.propertyKey,
          bucket: metadata.bucket,
          ttl: metadata.ttl,
          getKeyArgs: metadata.getKeyArgs,
        });
        this.logger.log(
          `Registered {${metadata.propertyKey.toString()}()} cache proxy`,
        );
      }
    }
  }
}
