import { Injectable } from '@nestjs/common';

export interface Method {
  invoke(args: unknown[]): unknown;
}

export interface InvocationHandler {
  handleInvocation(method: Method, args: unknown[]): unknown;
}

/**
 * Proxies invocations.
 */
@Injectable()
export class InvocationProxy {
  /**
   *
   */
  public proxyInvocation(
    target: any,
    propertyKey: string | symbol,
    invocationHandler: InvocationHandler,
  ): void {
    const originalMethod: Function = target[propertyKey];
    const proxifiedMethod: Function = (...args: unknown[]): unknown => {
      const method: Method = {
        invoke(args: unknown[]): unknown {
          return originalMethod.apply(target, args);
        },
      };
      return invocationHandler.handleInvocation(method, args);
    };
    target[propertyKey] = proxifiedMethod;
  }
}
