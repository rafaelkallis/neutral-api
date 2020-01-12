import { EntityManager } from 'typeorm';

export interface Database {
  /**
   *
   */
  getEntityManager(): EntityManager;
}
