import { Module } from '@nestjs/common';
import { Mediator } from 'shared/mediator/Mediator';

@Module({
  providers: [Mediator],
  exports: [Mediator],
})
export class MediatorModule {}
