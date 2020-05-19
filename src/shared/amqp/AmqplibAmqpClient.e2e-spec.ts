import { AmqplibAmqpClient } from 'shared/amqp/AmqplibAmqpClient';
import { AmqpClient } from 'shared/amqp/AmqpClient';
import { IntegrationTestScenario } from 'test/IntegrationTestScenario';

describe('amqplib amqp client', () => {
  let scenario: IntegrationTestScenario;
  let amqpClient: AmqplibAmqpClient;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
    amqpClient = scenario.module.get(AmqpClient);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  class Dto {
    a: string;
    b: number;

    constructor(a: string, b: number) {
      this.a = a;
      this.b = b;
    }
  }

  test('happy path', async () => {
    const messages: Dto[] = [];
    const subscription = await amqpClient.subscribe({
      exchange: 'covee.test',
      key: 'test_key',
      queue: 'test_queue',
      messageType: Dto,
      async handleMessage(message: Dto): Promise<void> {
        messages.push(message);
        return Promise.resolve();
      },
    });
    await amqpClient.publish({
      exchange: 'covee.test',
      key: 'test_key',
      message: new Dto('test', 123),
    });
    await scenario.sleep(500);
    await subscription.unsubscribe();
    expect(messages).toHaveLength(1);
    expect(messages[0]).toBeInstanceOf(Dto);
    expect(messages[0].a).toEqual('test');
    expect(messages[0].b).toEqual(123);
    expect(await amqpClient.getQueueStats('test_queue')).toEqual({
      messageCount: 0,
      consumerCount: 0,
    });
  });

  test('when message handler fails, we should reject the message', async () => {
    let messages = 0;
    const subscription = await amqpClient.subscribe({
      exchange: 'covee.test',
      key: 'test_key',
      queue: 'test_queue',
      messageType: Dto,
      async handleMessage(_message: Dto): Promise<void> {
        messages++;
        throw new Error('test error, nothing to worry about!');
        return Promise.resolve();
      },
    });
    await amqpClient.publish({
      exchange: 'covee.test',
      key: 'test_key',
      message: new Dto('test', 123),
    });
    await scenario.sleep(500);
    await subscription.unsubscribe();
    expect(messages).toBe(1);
    expect(await amqpClient.getQueueStats('test_queue')).toEqual({
      messageCount: 0,
      consumerCount: 0,
    });
  });
});
