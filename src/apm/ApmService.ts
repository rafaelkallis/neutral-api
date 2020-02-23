import { Request } from 'express';
import { User } from 'user/domain/User';

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
    user?: User,
  ): ApmTransaction;
}
