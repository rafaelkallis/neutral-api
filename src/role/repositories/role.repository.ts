import { Repository } from 'common';
import { Role } from 'role/role';
import { RoleEntity } from 'role/entities/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

/**
 * Role Repository
 */
export interface RoleRepository extends Repository<Role, RoleEntity> {
  /**
   *
   */
  findByProjectId(projectId: string): Promise<RoleEntity[]>;
}
