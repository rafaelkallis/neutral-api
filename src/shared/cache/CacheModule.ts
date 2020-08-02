import { Module, CacheModule as NestCacheModule } from '@nestjs/common';
// import { ConfigModule } from 'shared/config/ConfigModule';
// import { UtilityModule } from 'shared/utility/UtilityModule';
// import { CachePolicy } from 'shared/cache/application/CachePolicy';
// import { LruCachePolicy } from 'shared/cache/infrastructure/LruCachePolicy';
// import { CacheClient } from 'shared/cache/application/CacheClient';
// import { CacheStore } from 'shared/cache/application/CacheStore';
// import { MemoryCacheStore } from 'shared/cache/infrastructure/MemoryCacheStore';
// import { CacheKeyComputer } from 'shared/cache/application/CacheKeyComputer';
// import { Sha1CacheKeyComputer } from 'shared/cache/infrastructure/Sha1CacheKeyComputer';
// import { CacheConnector } from 'shared/cache/application/CacheConnector';

/**
 * Cache Module
 */
@Module({
  imports: [
    // ConfigModule,
    // UtilityModule,
    NestCacheModule.register(),
  ],
  // providers: [
  //   {
  //     provide: CachePolicy,
  //     useClass: LruCachePolicy,
  //   },
  //   {
  //     provide: CacheStore,
  //     useClass: MemoryCacheStore,
  //   },
  //   {
  //     provide: CacheKeyComputer,
  //     useClass: Sha1CacheKeyComputer,
  //   },
  //   CacheConnector,
  //   CacheClient,
  // ],
  exports: [
    // CacheClient,
    NestCacheModule,
  ],
})
export class CacheModule {}
