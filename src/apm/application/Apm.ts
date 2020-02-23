import { Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from 'user/domain/User';

export const APM = Symbol('APM');

export function InjectApm(): ParameterDecorator {
  return Inject(APM);
}

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
