import { Module } from '@nestjs/common';
import { ObjectStorage } from 'object-storage/application/ObjectStorage';
import { AzureObjectStorage } from 'object-storage/infrastructure/AzureObjectStorage';
import { ConfigModule } from 'config/ConfigModule';

/**
 * Object Storage Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: ObjectStorage,
      useClass: AzureObjectStorage,
    },
  ],
  exports: [ObjectStorage],
})
export class ObjectStorageModule {}
