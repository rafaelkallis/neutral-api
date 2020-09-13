import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { promises as fs, createReadStream, createWriteStream } from 'fs';
import path from 'path';
import os from 'os';
import ObjectID from 'bson-objectid';
import { Readable, Writable } from 'stream';

export class TempFile {
  public readonly path: string;
  private isCleaned: boolean;

  public constructor(path: string) {
    this.path = path;
    this.isCleaned = false;
  }

  public readStream(): Readable {
    return createReadStream(this.path);
  }

  public writeStream(): Writable {
    return createWriteStream(this.path);
  }

  public async cleanup(): Promise<void> {
    if (this.isCleaned) {
      return;
    }
    this.isCleaned = true;
    // TODO what if file doesn't exist anymore?
    // TODO what if file is used by another process?
    await fs.unlink(this.path);
  }
}

@Injectable()
export class TempFileFactory implements OnApplicationShutdown {
  private readonly createdFiles: TempFile[];

  public constructor() {
    this.createdFiles = [];
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.garbageCollection();
  }

  public createTempFile(): TempFile {
    const tmpdir = os.tmpdir();
    const filename = new ObjectID().toHexString() + '.tmp';
    const tempFilepath = path.join(tmpdir, filename);
    const tempFile = new TempFile(tempFilepath);
    this.createdFiles.push(tempFile);
    return tempFile;
  }

  private async garbageCollection(): Promise<void> {
    while (this.createdFiles.length > 0) {
      const file = this.createdFiles.pop();
      if (!file) {
        break;
      }
      await file.cleanup();
    }
  }
}
