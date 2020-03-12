import { Injectable } from '@nestjs/common';
import { ObjectStorage } from 'object-storage/application/ObjectStorage';
import { Readable } from 'stream';
import fs from 'fs';
import { ObjectNotFoundException } from 'object-storage/application/exceptions/ObjectNotFoundException';

/**
 * Fake Object Storage Service
 */
@Injectable()
export class FakeObjectStorage extends ObjectStorage {
  private readonly storage: Map<string, Map<string, Buffer>>;

  public constructor() {
    super();
    this.storage = new Map();
  }

  public async putFile(
    key: string,
    filepath: string,
    containerName?: string,
  ): Promise<void> {
    const readable = fs.createReadStream(filepath);
    this.putStream(key, readable, containerName);
  }

  public async putStream(
    key: string,
    stream: Readable,
    containerName?: string,
  ): Promise<void> {
    const chunks: Buffer[] = [];
    await new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve());
      stream.on('error', error => reject(error));
    });
    const buf = Buffer.concat(chunks);
    this.setBuffer(key, buf, containerName);
  }

  public async getFile(key: string, containerName?: string): Promise<string> {
    const buf = this.getBuffer(key, containerName);
    const tempFilepath = super.createTempFile();
    fs.writeFileSync(tempFilepath, buf);
    return tempFilepath;
  }

  public async getStream(
    key: string,
    containerName?: string,
  ): Promise<Readable> {
    const buf = this.getBuffer(key, containerName);
    const stream = new Readable();
    stream.push(buf);
    stream.push(null);
    return stream;
  }

  private getBuffer(
    key: string,
    containerName = this.defaultContainerName(),
  ): Buffer {
    const container = this.storage.get(containerName);
    if (!container) {
      throw new ObjectNotFoundException();
    }
    const blob = container.get(key);
    if (!blob) {
      throw new ObjectNotFoundException();
    }
    return blob;
  }

  private setBuffer(
    key: string,
    value: Buffer,
    containerName = this.defaultContainerName(),
  ): void {
    let container = this.storage.get(containerName);
    if (!container) {
      container = new Map();
      this.storage.set(containerName, container);
    }
    container.set(key, value);
  }
}
