import { Injectable } from '@nestjs/common';
import {
  ObjectStorage,
  PutReturn,
  GetReturn,
  PutContext,
  GetContext,
  DeleteContext,
} from 'object-storage/application/ObjectStorage';

/**
 * Mock Object Storage Service
 */
@Injectable()
export class MockObjectStorage extends ObjectStorage {
  public async put(_context: PutContext): Promise<PutReturn> {
    return { key: this.createKey() };
  }

  public async get(_context: GetContext): Promise<GetReturn> {
    const file = '';
    const contentType = '';
    return { file, contentType };
  }

  public async delete(_context: DeleteContext): Promise<void> {}
}
