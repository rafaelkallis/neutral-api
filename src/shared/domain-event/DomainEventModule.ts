import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { DomainEventHandlerRegistrar } from 'shared/domain-event/application/DomainEventHandlerRegistrar';
import { MemoryDomainEventBroker } from 'shared/domain-event/infrastructure/MemoryDomainEventBroker';

/**
 * Domain Event Module
 */
@Module({
  imports: [UtilityModule],
  providers: [
    { provide: DomainEventBroker, useClass: MemoryDomainEventBroker },
    DomainEventHandlerRegistrar,
  ],
  exports: [DomainEventBroker],
})
export class DomainEventModule {}
