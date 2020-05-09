import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { ArchiveFactory } from 'shared/archive/application/ArchiveFactory';
import { ArchiverArchiveFactory } from 'shared/archive/infrastructure/ArchiverArchiveFactory';

@Module({
  imports: [UtilityModule],
  providers: [{ provide: ArchiveFactory, useClass: ArchiverArchiveFactory }],
  exports: [ArchiveFactory],
})
export class ArchiveModule {}
