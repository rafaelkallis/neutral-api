import { Module } from '@nestjs/common';
import { OBJECT_STORAGE } from 'object-storage/application/ObjectStorage';
import { AzureObjectStorageService } from 'object-storage/infrastructure/AzureObjectStorageService';
import { ConfigModule } from 'config/ConfigModule';

/**
 * Object Storage Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: OBJECT_STORAGE,
      useClass: AzureObjectStorageService,
    },
  ],
  exports: [OBJECT_STORAGE],
})
export class ObjectStorageModule {}
