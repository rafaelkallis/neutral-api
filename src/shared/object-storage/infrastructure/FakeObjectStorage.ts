import { Injectable } from '@nestjs/common';
import {
  ObjectStorage,
  PutReturn,
  GetReturn,
  PutContext,
  GetContext,
  DeleteContext,
} from 'shared/object-storage/application/ObjectStorage';
import fs from 'fs';
import { ObjectNotFoundException } from 'shared/object-storage/application/exceptions/ObjectNotFoundException';

/**
 * Fake Object Storage Service
 */
@Injectable()
export class FakeObjectStorage extends ObjectStorage {
  private readonly storage: Map<
    string,
    Map<string, { data: Buffer; contentType: string }>
  >;

  public constructor() {
    super();
    this.storage = new Map();
  }

  public async put({
    containerName,
    file,
    contentType,
    key,
  }: PutContext): Promise<PutReturn> {
    key = key || this.createKey();
    const data = fs.readFileSync(file);
    let container = this.storage.get(containerName);
    if (!container) {
      container = new Map();
      this.storage.set(containerName, container);
    }
    container.set(key, { data, contentType });
    return { key };
  }

  public async get({ containerName, key }: GetContext): Promise<GetReturn> {
    const container = this.storage.get(containerName);
    if (!container) {
      throw new ObjectNotFoundException();
    }
    const blob = container.get(key);
    if (!blob) {
      throw new ObjectNotFoundException();
    }
    const { data, contentType } = blob;
    const file = super.createTempFile();
    fs.writeFileSync(file, data);
    return { file, contentType };
  }

  public async delete({ containerName, key }: DeleteContext): Promise<void> {
    const container = this.storage.get(containerName);
    if (!container) {
      throw new ObjectNotFoundException();
    }
    if (!container.has(key)) {
      throw new ObjectNotFoundException();
    }
    container.delete(key);
  }
}
