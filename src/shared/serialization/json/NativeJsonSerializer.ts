import { JsonSerializer } from 'shared/serialization/json/JsonSerializer';
import { Type } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export class NativeJsonSerializer extends JsonSerializer {
  public async serialize<T>(obj: T): Promise<Buffer> {
    validate(obj);
    const plain = classToPlain(obj);
    const jsonStr = JSON.stringify(plain);
    const jsonBuf = Buffer.from(jsonStr);
    return jsonBuf;
  }

  public async deserialize<T>(type: Type<T>, jsonBuf: Buffer): Promise<T> {
    const jsonStr = jsonBuf.toString();
    const plain = JSON.parse(jsonStr);
    const obj = plainToClass(type, plain);
    validate(obj);
    return obj;
  }
}
