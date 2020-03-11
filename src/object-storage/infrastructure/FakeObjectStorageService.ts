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
  private readonly storage: Map<string, Buffer>;

  public constructor() {
    super();
    this.storage = new Map();
  }

  public async putFile(key: string, filepath: string): Promise<void> {
    const readable = fs.createReadStream(filepath);
    this.putStream(key, readable);
  }

  public async putStream(key: string, stream: Readable): Promise<void> {
    const chunks: Buffer[] = [];
    await new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve());
      stream.on('error', error => reject(error));
    });
    const buf = Buffer.concat(chunks);
    this.storage.set(key, buf);
  }

  public async getFile(key: string): Promise<string> {
    const buf = this.storage.get(key);
    if (!buf) {
      throw new ObjectNotFoundException();
    }
    const tempFilepath = super.createTempFile();
    fs.writeFileSync(tempFilepath, buf);
    return tempFilepath;
  }

  public async getStream(key: string): Promise<Readable> {
    const buf = this.storage.get(key);
    if (!buf) {
      throw new ObjectNotFoundException();
    }
    const stream = new Readable();
    stream.push(buf);
    return stream;
  }
}
