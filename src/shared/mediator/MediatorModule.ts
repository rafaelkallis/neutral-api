import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { Mediator } from 'shared/mediator/Mediator';
import { RequestHandlerRegistrar } from 'shared/mediator/RequestHandlerRegistrar';

/**
 * Mediator Module
 */
@Module({
  imports: [UtilityModule],
  providers: [Mediator, RequestHandlerRegistrar],
  exports: [Mediator],
})
export class MediatorModule {}
