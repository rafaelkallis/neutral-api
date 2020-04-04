import { JsonSerializer } from 'shared/serialization/JsonSerializer';
import { Type } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export class NativeJsonSerializer extends JsonSerializer {
  public async serialize<T>(obj: T): Promise<Buffer> {
    validate(obj);
    const plain = classToPlain(obj);
    const str = JSON.stringify(plain);
    const buf = Buffer.from(str);
    return buf;
  }

  public async deserialize<T>(type: Type<T>, buf: Buffer): Promise<T> {
    const str = buf.toString();
    const plain = JSON.parse(str);
    const obj = plainToClass(type, plain);
    validate(obj);
    return obj;
  }
}
