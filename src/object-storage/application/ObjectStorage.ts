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
  private static readonly DEFAULT_CONTAINER_NAME = 'default';

  /**
   *
   */
  public abstract async putFile(
    key: string,
    filepath: string,
    containerName?: string,
  ): Promise<void>;
  /**
   *
   */
  public abstract async putStream(
    key: string,
    stream: Readable,
    containerName?: string,
  ): Promise<void>;

  /**
   *
   */
  public abstract async getFile(
    key: string,
    containerName?: string,
  ): Promise<string>;

  /**
   *
   */
  public abstract async getStream(
    key: string,
    containerName?: string,
  ): Promise<Readable>;

  /**
   *
   */
  protected defaultContainerName(): string {
    return ObjectStorage.DEFAULT_CONTAINER_NAME;
  }

  /**
   *
   */
  protected createTempFile(): string {
    const tmpdir = os.tmpdir();
    const filename = new ObjectID().toHexString() + '.tmp';
    return path.join(tmpdir, filename);
  }
}
