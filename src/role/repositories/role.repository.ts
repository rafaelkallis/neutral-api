import { Repository } from 'common';
import { RoleEntity } from 'role/entities/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

/**
 * Role Repository
 */
export interface RoleRepository extends Repository<RoleEntity> {
  /**
   *
   */
  findByProjectId(projectId: string): Promise<RoleEntity[]>;
}
