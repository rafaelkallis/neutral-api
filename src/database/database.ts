import { EntityManager } from 'typeorm';

export const DATABASE = Symbol('DATABASE');

export interface Database {
  /**
   *
   */
  getEntityManager(): EntityManager;
}
