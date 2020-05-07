import { Test } from '@nestjs/testing';
import { Type, Injectable } from '@nestjs/common';
import { Mediator } from 'shared/mediator/Mediator';
import { Request } from 'shared/mediator/Request';
import { RequestHandler } from 'shared/mediator/RequestHandler';
import { MediatorModule } from 'shared/mediator/MediatorModule';

describe(MediatorModule.name, () => {
  let mediator: Mediator;

  class TestRequest extends Request<number> {
    public constructor(public readonly input: number) {
      super();
    }
  }

  @Injectable()
  class TestRequestHandler extends RequestHandler<number, TestRequest> {
    public handle(request: TestRequest): number {
      return request.input + 1;
    }

    public getRequestType(): Type<TestRequest> {
      return TestRequest;
    }
  }

  class RejectingRequest extends Request<void> {}

  @Injectable()
  class RejectingRequestHandler extends RequestHandler<void, RejectingRequest> {
    public handle(request: RejectingRequest): void {
      throw new Error();
    }

    public getRequestType(): Type<RejectingRequest> {
      return RejectingRequest;
    }
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [MediatorModule],
      providers: [TestRequestHandler, RejectingRequestHandler],
    }).compile();
    await module.init();
    mediator = module.get(Mediator);
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
