import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { CacheClient } from 'shared/cache/application/CacheClient';
import {
  getCacheMetadataItems,
  CacheContext,
} from 'shared/cache/application/Cache';

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

  private registerCaches() {
    for (const service of this.serviceExplorer.exploreServices()) {
      const metadataItems = getCacheMetadataItems(service);
      if (metadataItems.length === 0) {
        continue;
      }
      this.logger.log(service.constructor.name);
      for (const { propertyKey, context } of metadataItems) {
        this.registerInterceptor(service, propertyKey, context);
        this.logger.log(`Registered {${propertyKey.toString()}()} cache`);
      }
    }
  }

  private registerInterceptor(
    target: any,
    propertyKey: string | symbol,
    context: CacheContext,
  ): void {
    const originalFunction: Function = target[propertyKey].bind(target);
    target[propertyKey] = (...args: unknown[]) => {
      const key = context.computeKey(...args);
      const optionalHit = this.cacheClient.get(context.store, key);
      if (optionalHit.isPresent()) {
        return optionalHit.orElseThrow(Error);
      }
      const result = originalFunction(...args);
      const isPromise = typeof result.then === 'function';
      if (isPromise) {
        return result.then((r: unknown) => {
          this.cacheClient.put(context.store, key, r);
          return r;
        });
      } else {
        this.cacheClient.put(context.store, key, result);
        return result;
      }
    };
  }
}
