import td from 'testdouble';
import { AmqpDomainEventBroker } from 'shared/domain-event/infrastructure/AmqpDomainEventBroker';
import { AmqpClient } from 'shared/amqp/AmqpClient';
import { DomainEvent } from 'shared/domain-event/domain/DomainEvent';
import { DomainEventHandler } from 'shared/domain-event/application/DomainEventBroker';
import { DomainEventKey } from 'shared/domain-event/domain/DomainEventKey';
import { Subscription } from 'shared/domain/Observer';

describe('amqp domain event broker', () => {
  let amqpClient: AmqpClient;
  let amqpDomainEventBroker: AmqpDomainEventBroker;

  beforeEach(() => {
    amqpClient = td.object();
    amqpDomainEventBroker = new AmqpDomainEventBroker(amqpClient);
  });

  @DomainEventKey('my_domain_event')
  class MyDomainEvent extends DomainEvent {}

  describe('publish', () => {
    let myDomainEvent: MyDomainEvent;

    beforeEach(() => {
      myDomainEvent = new MyDomainEvent();
      td.when(
        amqpClient.publish({
          exchange: 'covee.domain-events',
          key: 'my_domain_event',
          message: myDomainEvent,
        }),
      ).thenResolve();
    });

    test('happy path', async () => {
      await amqpDomainEventBroker.publish(myDomainEvent);
    });
  });

  describe('subscribe', () => {
    let subscription: Subscription;

    beforeEach(() => {
      subscription = td.object();
      td.when(amqpClient.subscribe(td.matchers.anything())).thenResolve(
        subscription,
      );
    });

    test('happy path', async () => {
      const domainEventHandler: DomainEventHandler<MyDomainEvent> = {
        key: 'test_handler',
        handleDomainEvent: td.function(async () => {}),
      };
      const actualSubscription = await amqpDomainEventBroker.subscribe(
        MyDomainEvent,
        domainEventHandler,
      );
      expect(actualSubscription).toBe(subscription);
    });
  });
});