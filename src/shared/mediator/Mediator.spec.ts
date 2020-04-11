import { Mediator } from 'shared/mediator/Mediator';
import { Request } from 'shared/mediator/Request';
import {
  RequestHandler,
  AbstractRequestHandler,
} from 'shared/mediator/RequestHandler';

describe(Mediator.name, () => {
  let mediator: Mediator;

  beforeEach(() => {
    mediator = new Mediator();
  });

  class TestRequest extends Request<string> {}

  @RequestHandler(TestRequest)
  class TestRequestHandler extends AbstractRequestHandler<string, TestRequest> {
    public async handle(request: TestRequest): Promise<string> {
      return 'test request handler result';
    }
  }

  test('integration', async () => {
    const testRequest = new TestRequest();

    const testRequestHandler = new TestRequestHandler();
    mediator.registerRequestHandler(TestRequest, testRequestHandler);
    jest.spyOn(testRequestHandler, 'handle');

    const actualResult = await mediator.send(testRequest);

    expect(testRequestHandler.handle).toHaveBeenCalledWith(testRequest);
    expect(actualResult).toBe('test request handler result');
  });
});
