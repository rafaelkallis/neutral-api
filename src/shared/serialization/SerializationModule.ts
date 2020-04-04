import { Module } from '@nestjs/common';
import { JsonSerializer } from 'shared/serialization/json/JsonSerializer';
import { NativeJsonSerializer } from 'shared/serialization/json/NativeJsonSerializer';
import { XmlSerializer } from 'shared/serialization/xml/XmlSerializer';
import { FxpXmlSerializer } from 'shared/serialization/xml/FxpXmlSerializer';

/**
 * Serialization Module
 */
@Module({
  providers: [
    { provide: JsonSerializer, useClass: NativeJsonSerializer },
    { provide: XmlSerializer, useClass: FxpXmlSerializer },
  ],
  exports: [JsonSerializer, XmlSerializer],
})
export class SerializationModule {}
