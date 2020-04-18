import { Mediator } from 'shared/mediator/Mediator';
import { Request } from 'shared/mediator/Request';
import { RequestHandler } from 'shared/mediator/RequestHandler';
import { Type } from '@nestjs/common';

describe(Mediator.name, () => {
  let mediator: Mediator;

  beforeEach(() => {
    mediator = new Mediator();
  });

  class TestRequest extends Request<string> {}

  class TestRequestHandler extends RequestHandler<string, TestRequest> {
    public async handle(request: TestRequest): Promise<string> {
      return 'test request handler result';
    }

    public getRequestType(): Type<TestRequest> {
      return TestRequest;
    }
  }

  test('integration', async () => {
    const testRequest = new TestRequest();

    const testRequestHandler = new TestRequestHandler();
    mediator.registerRequestHandler(testRequestHandler);
    jest.spyOn(testRequestHandler, 'handle');

    const actualResult = await mediator.send(testRequest);

    expect(testRequestHandler.handle).toHaveBeenCalledWith(testRequest);
    expect(actualResult).toBe('test request handler result');
  });
});
