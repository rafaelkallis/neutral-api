import { Repository } from 'common/domain/Repository';
import { RoleModel } from 'role/domain/RoleModel';
import { Id } from 'common/domain/value-objects/Id';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

/**
 * Role Repository
 */
export interface RoleRepository extends Repository<RoleModel> {
  /**
   *
   */
  findByProjectId(projectId: Id): Promise<RoleModel[]>;

  /**
   *
   */
  findByAssigneeId(assigneeId: Id): Promise<RoleModel[]>;
}
