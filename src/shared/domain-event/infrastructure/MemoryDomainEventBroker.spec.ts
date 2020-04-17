import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventHandler } from 'shared/domain-event/application/DomainEventBroker';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { MemoryDomainEventBroker } from './MemoryDomainEventBroker';

describe('amqp domain event broker', () => {
  let domainEventBroker: MemoryDomainEventBroker;

  beforeEach(() => {
    domainEventBroker = new MemoryDomainEventBroker();
  });

  @DomainEventKey('my_domain_event')
  class MyDomainEvent extends DomainEvent {}

  test('integration', async () => {
    const domainEvent = new MyDomainEvent();

    const domainEventHandler: DomainEventHandler<MyDomainEvent> = {
      key: 'test_handler',
      async handleDomainEvent(actualDomainEvent: MyDomainEvent): Promise<void> {
        expect(actualDomainEvent).toBe(domainEvent);
      },
    };
    const subscription = await domainEventBroker.subscribe(
      MyDomainEvent,
      domainEventHandler,
    );

    await domainEventBroker.publish(domainEvent);

    await subscription.unsubscribe();

    await domainEventBroker.publish(new MyDomainEvent());

    expect.assertions(1);
  });
});
