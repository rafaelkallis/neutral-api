import { Injectable } from '@nestjs/common';
import {
  DomainEventBroker,
  DomainEventSubscription,
} from 'shared/domain-event/application/DomainEventBroker';

@Injectable()
export class MockDomainEventBroker extends DomainEventBroker {
  public async publish(): Promise<void> {
    throw new Error('mocked method');
  }

  public async subscribe(): Promise<DomainEventSubscription> {
    throw new Error('mocked method');
  }
}
