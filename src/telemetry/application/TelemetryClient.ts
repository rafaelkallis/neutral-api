import { Request, Response } from 'express';
import { User } from 'user/domain/User';

/**
 * Telemetry Client.
 */
export abstract class TelemetryClient {
  /**
   *
   */
  public abstract setTransaction(
    request: Request,
    response: Response,
    user?: User,
  ): void;

  /**
   * Start a new action.
   * @param name The action's name.
   */
  public abstract createAction(name: string): TelemetryAction;

  public abstract error(error: Error): void;
}

export interface TelemetryAction {
  /**
   *
   */
  end(): void;
}
