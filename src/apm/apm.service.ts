import { Request } from 'express';
import { UserModel } from 'user';

/**
 *
 */
export interface ApmTransaction {
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
 * Apm Service
 */
export abstract class ApmService {
  /**
   *
   */
  public abstract createTransaction(
    request: Request,
    user?: UserModel,
  ): ApmTransaction;
}
