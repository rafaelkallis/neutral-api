import { Mediator } from 'shared/mediator/Mediator';
import { Request } from 'shared/mediator/Request';
import {
  AbstractRequestHandler,
  RequestHandler,
} from 'shared/mediator/RequestHandler';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ContextIdFactory } from '@nestjs/core';

describe(Mediator.name, () => {
  let scenario: UnitTestScenario<Mediator>;
  let mediator: Mediator;

  class TestRequest extends Request<number> {
    public constructor(public readonly input: number) {
      super();
    }
  }

  @RequestHandler(TestRequest)
  class TestRequestHandler extends AbstractRequestHandler<number, TestRequest> {
    public handle(request: TestRequest): number {
      return request.input + 1;
    }
  }

  class RejectingRequest extends Request<void> {}

  @RequestHandler(RejectingRequest)
  class RejectingRequestHandler extends AbstractRequestHandler<
    void,
    RejectingRequest
  > {
    public handle(request: RejectingRequest): void {
      throw new Error();
    }
  }

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(Mediator)
      .addProvider(TestRequestHandler)
      .addProvider(RejectingRequestHandler)
      .build();
    mediator = scenario.subject;
    const contextId = ContextIdFactory.create();
    jest.spyOn(ContextIdFactory, 'getByRequest').mockReturnValue(contextId);
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
