import { Inject } from '@nestjs/common';
import { Readable } from 'stream';
import os from 'os';
import path from 'path';
import ObjectID from 'bson-objectid';

export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

/**
 *
 */
export function InjectObjectStorage(): ParameterDecorator {
  return Inject(OBJECT_STORAGE);
}

/**
 *
 */
export abstract class ObjectStorage {
  /**
   *
   */
  public abstract async putFile(key: string, filepath: string): Promise<void>;
  /**
   *
   */
  public abstract async putStream(key: string, stream: Readable): Promise<void>;

  /**
   *
   */
  public abstract async getFile(key: string): Promise<string>;

  /**
   *
   */
  public abstract async getStream(key: string): Promise<Readable>;

  /**
   *
   */
  protected createTempFile(): string {
    const tmpdir = os.tmpdir();
    const filename = new ObjectID().toHexString() + '.tmp';
    return path.join(tmpdir, filename);
  }
}
