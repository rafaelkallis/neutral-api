import { Serializer } from 'shared/serialization/Serializer';
import { Type } from '@nestjs/common';

export abstract class JsonSerializer implements Serializer {
  public abstract serialize<T>(obj: T): Promise<Buffer>;
  public abstract deserialize<T>(type: Type<T>, buf: Buffer): Promise<T>;
}
