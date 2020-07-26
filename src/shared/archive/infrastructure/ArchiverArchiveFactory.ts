import { Injectable } from '@nestjs/common';
import {
  ArchiveFactory,
  ArchiveBuilder,
  ArchiveContent,
} from 'shared/archive/application/ArchiveFactory';
import { Writable, pipeline as pipelineCallback } from 'stream';
import { promisify } from 'util';
import archiver from 'archiver';

const pipeline = promisify(pipelineCallback);

export class ArchiverArchiveBuilder extends ArchiveBuilder {
  protected async doBuild(
    zipContents: ReadonlyArray<ArchiveContent>,
    writable: Writable,
  ): Promise<{ contentType: string }> {
    // TODO research zlib compression level and other options
    const archive = archiver('zip');
    const promiseResult = pipeline(archive, writable);
    for (const { path, content } of zipContents) {
      archive.append(content, { name: path });
    }
    await archive.finalize();
    await promiseResult;
    return { contentType: 'application/zip' };
  }
}

@Injectable()
export class ArchiverArchiveFactory extends ArchiveFactory {
  public createArchiveBuilder(): ArchiveBuilder {
    return new ArchiverArchiveBuilder(this.tempFileFactory);
  }
}
