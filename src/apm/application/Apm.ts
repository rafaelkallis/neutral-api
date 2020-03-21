import { Request, Response } from 'express';
import { User } from 'user/domain/User';

export interface ApmActivity {
  /**
   *
   */
  end(): void;
}

/**
 *
 */
export interface ApmTransaction {
  /**
   *
   */
  createActivity(name: string): ApmActivity;

  /**
   *
   */
  success(): void;

  /**
   *
   */
  failure(error: Error): void;
}

/**
 * Apm
 */
export abstract class Apm {
  /**
   *
   */
  public abstract createTransaction(
    request: Request,
    response: Response,
    user?: User,
  ): ApmTransaction;
}
