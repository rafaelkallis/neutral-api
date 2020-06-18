import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CacheClient } from 'shared/cache/application/CacheClient';
import {
  getCacheMetadataItems,
  getCacheClasses,
} from 'shared/cache/application/Cache';
import { ServiceLocator } from 'shared/utility/application/ServiceLocator';

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
    for (const registered of getCacheClasses()) {
      const resolved = await this.serviceLocator.getService(registered);
      const metadataItems = getCacheMetadataItems(resolved);
      if (metadataItems.length === 0) {
        continue;
      }
      for (const metadata of metadataItems) {
        this.cacheClient.cacheMethod({
          target: resolved,
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
