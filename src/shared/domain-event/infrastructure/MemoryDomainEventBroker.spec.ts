import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { MemoryDomainEventBroker } from './MemoryDomainEventBroker';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { DomainEventObserver } from '../application/DomainEventBroker';

describe(MemoryDomainEventBroker.name, () => {
  let scenario: UnitTestScenario<MemoryDomainEventBroker>;
  let domainEventBroker: MemoryDomainEventBroker;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(MemoryDomainEventBroker).build();
    domainEventBroker = scenario.subject;
  });

  @DomainEventKey('my_domain_event')
  class MyDomainEvent extends DomainEvent {}

  test('integration', async () => {
    const domainEvent = new MyDomainEvent();

    const domainEventHandler: DomainEventObserver<MyDomainEvent> = {
      key: 'test_handler',
      async handle(actualDomainEvent: MyDomainEvent): Promise<void> {
        // TODO code smell!
        expect(actualDomainEvent).toBe(domainEvent);
        return Promise.resolve();
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
