import { Serializer } from 'shared/serialization/Serializer';
import { Type } from '@nestjs/common';

export abstract class XmlSerializer implements Serializer {
  public abstract serialize<T>(obj: T): Promise<Buffer>;
  public abstract deserialize<T>(type: Type<T>, xmlBuf: Buffer): Promise<T>;
}
