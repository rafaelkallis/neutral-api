import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { DomainEventHandlerRegistrar } from 'shared/domain-event/application/DomainEventHandlerRegistrar';
import { MemoryDomainEventBroker } from 'shared/domain-event/infrastructure/MemoryDomainEventBroker';
import { AmqpModule } from 'shared/amqp/AmqpModule';
import { AmqpDomainEventBroker } from 'shared/domain-event/infrastructure/AmqpDomainEventBroker';
import { PersistedModelsDomainEventConnector } from 'shared/domain-event/application/PersistedModelsDomainEventConnector';

/**
 * Domain Event Module
 */
@Module({
  imports: [UtilityModule, AmqpModule],
  providers: [
    MemoryDomainEventBroker,
    AmqpDomainEventBroker,
    { provide: DomainEventBroker, useExisting: MemoryDomainEventBroker },
    DomainEventHandlerRegistrar,
    PersistedModelsDomainEventConnector,
  ],
  exports: [DomainEventBroker],
})
export class DomainEventModule {}
