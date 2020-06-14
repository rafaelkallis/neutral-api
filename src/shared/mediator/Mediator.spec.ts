import { Mediator } from 'shared/mediator/Mediator';
import { Request } from 'shared/mediator/Request';
import { RequestHandler } from 'shared/mediator/RequestHandler';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Injectable } from '@nestjs/common';
import { ServiceLocator } from 'shared/utility/application/ServiceLocator';

describe(Mediator.name, () => {
  let scenario: UnitTestScenario<Mediator>;
  let mediator: Mediator;

  class TestRequest extends Request<number> {
    public constructor(public readonly input: number) {
      super();
    }
  }

  @Injectable()
  @RequestHandler.register(TestRequest)
  class TestRequestHandler extends RequestHandler<number, TestRequest> {
    public handle(request: TestRequest): number {
      return request.input + 1;
    }
  }

  class RejectingRequest extends Request<void> {}

  @RequestHandler.register(RejectingRequest)
  class RejectingRequestHandler extends RequestHandler<void, RejectingRequest> {
    public handle(_request: RejectingRequest): void {
      throw new Error();
    }
  }

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(Mediator)
      .addProvider(ServiceLocator)
      .addProvider(TestRequestHandler)
      .addProvider(RejectingRequestHandler)
      .build();
    mediator = scenario.subject;
  });

  test('happy path', async () => {
    const testRequest = new TestRequest(1);

    const actualResult = await mediator.send(testRequest);

    expect(actualResult).toBe(2);
  });

  test('rejection inside handler', async () => {
    const request = new RejectingRequest();

    await expect(mediator.send(request)).rejects.toThrowError();
  });
});
