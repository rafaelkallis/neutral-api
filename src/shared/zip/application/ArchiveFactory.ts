import { Injectable } from '@nestjs/common';
import { Readable, Writable, finished } from 'stream';
import fs from 'fs';
import tmp from 'tmp-promise';

export interface ArchiveContent {
  path: string;
  content: string | Readable;
}

export abstract class ArchiveBuilder {
  private isBuilt: boolean;
  private readonly archiveContents: ArchiveContent[];

  public constructor() {
    this.isBuilt = false;
    this.archiveContents = [];
  }

  public addString(path: string, content: string): this {
    this.assertNotBuilt();
    this.archiveContents.push({ path, content });
    return this;
  }
  public addStream(path: string, content: Readable): this {
    this.assertNotBuilt();
    this.archiveContents.push({ path, content });
    return this;
  }
  public addFile(path: string, content: string): this {
    return this.addStream(path, fs.createReadStream(content));
  }
  public async build(): Promise<Readable> {
    this.assertNotBuilt();
    this.isBuilt = true;
    const tmpFile = await tmp.file();
    const writable = fs.createWriteStream(tmpFile.path);
    await this.doBuild(this.archiveContents, writable);
    const readable = fs.createReadStream(tmpFile.path);
    finished(readable, () => tmpFile.cleanup());
    return readable;
  }

  protected abstract async doBuild(
    zipContents: ReadonlyArray<ArchiveContent>,
    writable: Writable,
  ): Promise<void>;

  private assertNotBuilt(): void {
    if (this.isBuilt) {
      throw new Error('zip is built already');
    }
  }
}

@Injectable()
export abstract class ArchiveFactory {
  public abstract createArchiveBuilder(): ArchiveBuilder;
}
