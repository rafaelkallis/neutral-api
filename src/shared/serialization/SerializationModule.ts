import { Module } from '@nestjs/common';
import { JsonSerializer } from 'shared/serialization/JsonSerializer';
import { NativeJsonSerializer } from 'shared/serialization/NativeJsonSerializer';

/**
 * Serialization Module
 */
@Module({
  providers: [{ provide: JsonSerializer, useClass: NativeJsonSerializer }],
  exports: [JsonSerializer],
})
export class SerializationModule {}
