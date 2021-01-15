import { Serializer } from 'shared/serialization/Serializer';
import { Type } from '@nestjs/common';

export abstract class JsonSerializer implements Serializer {
  public abstract serialize<T extends object>(obj: T): Promise<Buffer>;
  public abstract deserialize<T extends object>(
    type: Type<T>,
    jsonBuf: Buffer,
  ): Promise<T>;
}
