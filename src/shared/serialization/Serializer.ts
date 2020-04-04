import { Type } from '@nestjs/common';

export interface Serializer {
  /**
   * Serializes the provided object to a buffer.
   * @param obj The object to serialize.
   */
  serialize<T>(obj: T): Promise<Buffer>;

  /**
   * Deserializes the provided buffer to an object with the given type.
   * @param buf The buffer to deserialize.
   * @param type The type of the resulting object.
   */
  deserialize<T>(type: Type<T>, buf: Buffer): Promise<T>;
}
