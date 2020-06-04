import { Module } from '@nestjs/common';
import { Mediator } from 'shared/mediator/Mediator';
import { UtilityModule } from 'shared/utility/UtilityModule';

@Module({
  imports: [UtilityModule],
  providers: [Mediator],
  exports: [Mediator],
})
export class MediatorModule {}
