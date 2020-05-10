import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import ObjectID from 'bson-objectid';

@Injectable()
export class TempFileFactory implements OnApplicationShutdown {
  private readonly createdFiles: string[];

  public constructor() {
    this.createdFiles = [];
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.garbageCollection();
  }

  public createTempFile(): string {
    const tmpdir = os.tmpdir();
    const filename = new ObjectID().toHexString() + '.tmp';
    const tempFile = path.join(tmpdir, filename);
    this.createdFiles.push(tempFile);
    return tempFile;
  }

  private async garbageCollection(): Promise<void> {
    while (this.createdFiles.length > 0) {
      const file = this.createdFiles.pop() as string;
      // TODO what if file doesn't exist anymore?
      // TOFO what if file is used by another process?
      await fs.unlink(file);
    }
  }
}
