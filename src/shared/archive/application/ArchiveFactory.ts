import { Injectable } from '@nestjs/common';
import { Readable, Writable } from 'stream';
import fs from 'fs';
import { TempFileFactory } from 'shared/utility/application/TempFileFactory';

export interface ArchiveBuildResult {
  file: string;
  contentType: string;
}

export interface ArchiveContent {
  path: string;
  content: string | Readable;
}

export abstract class ArchiveBuilder {
  private readonly tempFileFactory: TempFileFactory;
  private readonly archiveContents: ArchiveContent[];
  private isBuilt: boolean;

  public constructor(tempFileFactory: TempFileFactory) {
    this.tempFileFactory = tempFileFactory;
    this.archiveContents = [];
    this.isBuilt = false;
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

  public async build(): Promise<ArchiveBuildResult> {
    this.assertNotBuilt();
    this.isBuilt = true;
    const tempFile = this.tempFileFactory.createTempFile();
    const writable = fs.createWriteStream(tempFile);
    const { contentType } = await this.doBuild(this.archiveContents, writable);
    return { file: tempFile, contentType };
  }

  protected abstract async doBuild(
    zipContents: ReadonlyArray<ArchiveContent>,
    writable: Writable,
  ): Promise<{ contentType: string }>;

  private assertNotBuilt(): void {
    if (this.isBuilt) {
      throw new Error('zip is built already');
    }
  }
}

@Injectable()
export abstract class ArchiveFactory {
  protected readonly tempFileFactory: TempFileFactory;

  public constructor(tempFileFactory: TempFileFactory) {
    this.tempFileFactory = tempFileFactory;
  }

  public abstract createArchiveBuilder(): ArchiveBuilder;
}