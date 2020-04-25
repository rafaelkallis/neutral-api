import {
  InvocationHandler,
  Method,
} from 'shared/utility/application/InvocationProxy';
import { TelemetryClient } from 'shared/telemetry/application/TelemetryClient';

export class TelemetryActionInvocationHandler implements InvocationHandler {
  private readonly telemetryClient: TelemetryClient;
  private readonly actionName: string;

  public constructor(telemetryClient: TelemetryClient, actionName: string) {
    this.telemetryClient = telemetryClient;
    this.actionName = actionName;
  }

  public handleInvocation(method: Method, args: unknown[]): unknown {
    const telemetryAction = this.telemetryClient
      .getCurrentTransaction()
      .createAction(this.actionName);
    try {
      const result = method.invoke(args);
      if (isPromise(result)) {
        return result.finally(() => telemetryAction.end());
      } else {
        telemetryAction.end();
        return result;
      }
      // "finally" would be wrong here, problematic when result is a promise
    } catch (error) {
      telemetryAction.end();
      throw error;
    }
  }
}

function isPromise(value: unknown): value is Promise<unknown> {
  return (
    typeof (value as any).then === 'function' &&
    typeof (value as any).finally === 'function'
  );
}
