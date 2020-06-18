import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CacheClient } from 'shared/cache/application/CacheClient';
import { Cache } from 'shared/cache/application/Cache';
import { ServiceLocator } from 'shared/utility/application/ServiceLocator';
import { ClassHierarchyIterable } from 'shared/domain/Class';

@Injectable()
export class CacheConnector implements OnModuleInit {
  private readonly logger: Logger;
  private readonly serviceLocator: ServiceLocator;
  private readonly cacheClient: CacheClient;

  public constructor(serviceLocator: ServiceLocator, cacheClient: CacheClient) {
    this.logger = new Logger(CacheConnector.name);
    this.serviceLocator = serviceLocator;
    this.cacheClient = cacheClient;
  }

  public async onModuleInit(): Promise<void> {
    await this.connectCaches();
  }

  private async connectCaches(): Promise<void> {
    for (const registrantClass of Cache.registry.keys()) {
      const cacheMetadataItems = Cache.registry.get(registrantClass);
      for (const hierarchyClass of ClassHierarchyIterable.of(registrantClass)) {
        const registrant = await this.serviceLocator.getService(hierarchyClass);
        if (!registrant) {
          continue;
        }
        for (const metadata of cacheMetadataItems) {
          this.cacheClient.cacheMethod({
            target: registrant,
            method: metadata.propertyKey,
            bucket: metadata.bucket,
            ttl: metadata.ttl,
            getKeyArgs: metadata.getKeyArgs,
          });
          this.logger.log(
            `Registered {${metadata.propertyKey.toString()}()} cache proxy`,
          );
        }
        break;
      }
    }
  }
}
