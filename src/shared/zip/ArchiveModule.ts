import { Module } from '@nestjs/common';
import { ArchiveFactory } from 'shared/zip/application/ArchiveFactory';
import { ArchiverArchiveFactory } from 'shared/zip/infrastructure/ArchiverArchiveFactory';

@Module({
  providers: [{ provide: ArchiveFactory, useClass: ArchiverArchiveFactory }],
  exports: [ArchiveFactory],
})
export class ArchiveModule {}
