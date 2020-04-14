import { JsonSerializer } from 'shared/serialization/json/JsonSerializer';
import { Type, InternalServerErrorException } from '@nestjs/common';
import { serialize, deserialize } from 'class-transformer';
import { validate } from 'class-validator';

export class NativeJsonSerializer extends JsonSerializer {
  public async serialize<T>(obj: T): Promise<Buffer> {
    validate(obj);
    let jsonStr: string;
    try {
      jsonStr = serialize(obj);
    } catch (error) {
      if (error instanceof RangeError) {
        throw new InternalServerErrorException(
          `circular dependency in ${(obj as any).constructor.name}`,
        );
      }
      throw error;
    }
    const jsonBuf = Buffer.from(jsonStr);
    return jsonBuf;
  }

  public async deserialize<T>(type: Type<T>, jsonBuf: Buffer): Promise<T> {
    const jsonStr = jsonBuf.toString();
    const obj = deserialize(type, jsonStr);
    validate(obj);
    return obj;
  }
}
