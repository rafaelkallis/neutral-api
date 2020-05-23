import { Module } from '@nestjs/common';
import { UtilityModule } from 'shared/utility/UtilityModule';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { DomainEventHandlerRegistrar } from 'shared/domain-event/application/DomainEventHandlerRegistrar';
import { MemoryDomainEventBroker } from 'shared/domain-event/infrastructure/MemoryDomainEventBroker';
import { AmqpModule } from 'shared/amqp/AmqpModule';
import { AmqpDomainEventBroker } from 'shared/domain-event/infrastructure/AmqpDomainEventBroker';
import { CommittedModelDomainEventPublishingConnector } from 'shared/domain-event/application/CommittedModelDomainEventPublishingConnector';
import { UnitOfWorkModule } from 'shared/unit-of-work/UnitOfWorkModule';

/**
 * Domain Event Module
 */
@Module({
  imports: [UtilityModule, AmqpModule, UnitOfWorkModule],
  providers: [
    MemoryDomainEventBroker,
    AmqpDomainEventBroker,
    { provide: DomainEventBroker, useExisting: MemoryDomainEventBroker },
    DomainEventHandlerRegistrar,
    CommittedModelDomainEventPublishingConnector,
  ],
  exports: [DomainEventBroker],
})
export class DomainEventModule {}
