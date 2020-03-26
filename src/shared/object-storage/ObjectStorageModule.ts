import { Module } from '@nestjs/common';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { AzureObjectStorage } from 'shared/object-storage/infrastructure/AzureObjectStorage';
import { ConfigModule } from 'shared/config/ConfigModule';

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
