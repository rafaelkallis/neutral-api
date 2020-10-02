import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { DomainEventHandlerConnector } from 'shared/domain-event/application/DomainEventHandlerConnector';
import { MemoryDomainEventBroker } from 'shared/domain-event/infrastructure/MemoryDomainEventBroker';
import { PersistedModelsDomainEventConnector } from './application/PersistedModelsDomainEventConnector';

/**
 * Domain Event Module
 */
@Module({
  imports: [UtilityModule /*, AmqpModule */],
  providers: [
    MemoryDomainEventBroker,
    { provide: DomainEventBroker, useExisting: MemoryDomainEventBroker },
    DomainEventHandlerConnector,
    PersistedModelsDomainEventConnector,
  ],
  exports: [DomainEventBroker],
})
export class DomainEventModule {}
