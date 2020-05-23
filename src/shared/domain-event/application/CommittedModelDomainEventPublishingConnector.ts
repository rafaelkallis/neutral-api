import { Injectable } from '@nestjs/common';
import { Connector } from 'shared/application/Connector';
import { UnitOfWork } from 'shared/unit-of-work/domain/UnitOfWork';
import { DomainEventBroker } from './DomainEventBroker';
import { ReadonlyUnitOfWorkState } from 'shared/unit-of-work/domain/UnitOfWorkState';
import { Observer } from 'shared/domain/Observer';
import { Id } from 'shared/domain/value-objects/Id';
import { ReadonlyAggregateRoot } from 'shared/domain/AggregateRoot';

@Injectable()
export class CommittedModelDomainEventPublishingConnector extends Connector
  implements Observer<[ReadonlyAggregateRoot<Id>, ReadonlyUnitOfWorkState]> {
  private readonly unitOfWork: UnitOfWork;
  private readonly domainEventBroker: DomainEventBroker;

  public constructor(
    unitOfWork: UnitOfWork,
    domainEventBroker: DomainEventBroker,
  ) {
    super();
    this.unitOfWork = unitOfWork;
    this.domainEventBroker = domainEventBroker;
  }

  protected async connect(): Promise<void> {
    const subscription = await this.unitOfWork.committedModels.subscribe(this);
    this.manageSuscription(subscription);
  }

  async handle([aggregateRoot]: [
    ReadonlyAggregateRoot<Id>,
    ReadonlyUnitOfWorkState,
  ]): Promise<void> {
    await this.domainEventBroker.publishFromAggregateRoot(aggregateRoot);
  }
}
