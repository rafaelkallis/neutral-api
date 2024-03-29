import { AmqpDomainEventBroker } from 'shared/domain-event/infrastructure/AmqpDomainEventBroker';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { DomainEventObserver } from '../application/DomainEventBroker';

describe.skip(AmqpDomainEventBroker.name, () => {
  let scenario: IntegrationTestScenario;
  let amqpDomainEventBroker: AmqpDomainEventBroker;

  @DomainEventKey('my_domain_event')
  class MyDomainEvent extends DomainEvent {
    public constructor(public id: string) {
      super();
    }
  }

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    amqpDomainEventBroker = scenario.module.get(AmqpDomainEventBroker);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  test('happy path', async () => {
    const myDomainEvent = new MyDomainEvent('test');
    let actualDomainEvent: DomainEvent | null = null;
    const domainEventHandler: DomainEventObserver<MyDomainEvent> = {
      key: 'test_my_domain_event_handler',
      async handle(domainEvent: MyDomainEvent): Promise<void> {
        // no assertions in here!
        actualDomainEvent = domainEvent;
        return Promise.resolve();
      },
    };
    const subscription = await amqpDomainEventBroker.subscribe(
      MyDomainEvent,
      domainEventHandler,
    );
    await amqpDomainEventBroker.publish(myDomainEvent);
    await scenario.sleep(500);
    await subscription.unsubscribe();
    expect(actualDomainEvent).toEqual(myDomainEvent);
  });
});
