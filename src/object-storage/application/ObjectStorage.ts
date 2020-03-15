import { Inject } from '@nestjs/common';
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

export interface PutContext {
  containerName: string;
  file: string;
  contentType: string;
  key?: string;
}

export interface PutReturn {
  key: string;
}

export interface GetContext {
  containerName: string;
  key: string;
}

export interface GetReturn {
  file: string;
  contentType: string;
}

/**
 *
 */
export abstract class ObjectStorage {
  /**
   *
   */
  public abstract async put(context: PutContext): Promise<PutReturn>;

  /**
   *
   */
  public abstract async get(context: GetContext): Promise<GetReturn>;

  /**
   *
   */
  protected createKey(): string {
    return new ObjectID().toHexString();
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
