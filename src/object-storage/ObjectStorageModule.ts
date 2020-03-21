import { Module } from '@nestjs/common';
import { ObjectStorage } from 'object-storage/application/ObjectStorage';
import { AzureObjectStorageService } from 'object-storage/infrastructure/AzureObjectStorageService';
import { ConfigModule } from 'config/ConfigModule';

/**
 * Object Storage Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: ObjectStorage,
      useClass: AzureObjectStorageService,
    },
  ],
  exports: [ObjectStorage],
})
export class ObjectStorageModule {}
