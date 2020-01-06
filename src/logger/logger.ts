import { LoggerService } from '@nestjs/common';

export const LOGGER = Symbol('LOGGER');

/**
 * Logger
 */
export interface Logger extends LoggerService {
  /**
   * Log a message at the default level.
   */
  log(message: string): void;

  /**
   * Log a message at the 'debug' level.
   */
  debug(message: string): void;

  /**
   * Log a message at the 'info' level.
   */
  info(message: string): void;

  /**
   * Log a message at the 'warn' level.
   */
  warn(message: string): void;

  /**
   * Log a message at the 'error' level.
   */
  error(message: string): void;
}
