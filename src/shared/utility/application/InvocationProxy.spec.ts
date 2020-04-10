import {
  InvocationProxy,
  InvocationHandler,
} from 'shared/utility/application/InvocationProxy';

describe(InvocationProxy.name, () => {
  let invocationProxy: InvocationProxy;

  beforeEach(() => {
    invocationProxy = new InvocationProxy();
  });

  test('happy path', () => {
    const originalArg0 = 'original arg0';
    const originalArg1 = 1;

    const proxiedArg0 = 'proxied arg0';
    const proxiedArg1 = 2;

    const originalResult = 'result';
    const proxiedResult = 'proxied result';

    const subject = {
      f(actualArg0: string, actualArg1: number): string {
        expect(this).toEqual(subject);
        expect(actualArg0).toBe(proxiedArg0);
        expect(actualArg1).toBe(proxiedArg1);
        return originalResult;
      },
    };
    const invocationHandler: InvocationHandler = {
      handleInvocation(method, args) {
        expect(args[0]).toBe(originalArg0);
        expect(args[1]).toBe(originalArg1);
        const actualOriginalResult = method.invoke([proxiedArg0, proxiedArg1]);
        expect(actualOriginalResult).toBe(originalResult);
        return proxiedResult;
      },
    };
    invocationProxy.proxyInvocation(subject, 'f', invocationHandler);
    const actualProxiedResult = subject.f(originalArg0, originalArg1);
    expect(actualProxiedResult).toBe(proxiedResult);
    expect.assertions(7);
  });
});
