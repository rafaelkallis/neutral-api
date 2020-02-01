import { Repository } from 'common';
import { RoleModel } from 'role/role.model';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

/**
 * Role Repository
 */
export interface RoleRepository extends Repository<RoleModel> {
  /**
   *
   */
  findByProjectId(projectId: string): Promise<RoleModel[]>;

  /**
   *
   */
  findByAssigneeId(assigneeId: string): Promise<RoleModel[]>;
}
